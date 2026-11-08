// Post-deploy smoke test for the LIVE site. Run it against the Vercel alias before the domain is switched on, and again against
// the real address afterwards. It only reads; it changes nothing.
//
//   npm run smoke -- https://nailasbeautystudio.com
//   npm run smoke -- https://PROJECT.vercel.app --no-canonical-host      (alias: canonicals legitimately say nailasbeautystudio.com)
//   npm run smoke -- https://nailasbeautystudio.com --www https://www.nailasbeautystudio.com --alias https://PROJECT.vercel.app
//   npm run smoke -- http://127.0.0.1:4400 --local                      (a local server: skips the checks that need a real host)
//
// Exit code 0 = every check passed (warnings are listed but do not fail); 1 = at least one check failed.
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const base = (args.find((a) => /^https?:\/\//.test(a)) || '').replace(/\/+$/, '');
if (!base) { console.error('Usage: npm run smoke -- <https://address> [--www <url>] [--alias <url>] [--no-canonical-host] [--local]'); process.exit(2); }
const local = flag('--local'), baseHost = new URL(base).host;
const results = [];
const ok = (name, detail = '') => results.push({ s: 'PASS', name, detail });
const bad = (name, detail = '') => results.push({ s: 'FAIL', name, detail });
const warn = (name, detail = '') => results.push({ s: 'WARN', name, detail });
const get = async (url, init = {}) => { try { return await fetch(url, { redirect: 'manual', headers: { 'accept-encoding': 'br, gzip', 'user-agent': 'naila-smoke-test' }, ...init }); } catch (e) { return { status: 0, error: e.message, headers: new Headers(), text: async () => '' }; } };
const loc = (r) => r.headers.get('location') || '';

// 1. Is the site reachable and public (not behind a login)?
const home = await get(base + '/');
if (!home.status) { bad('home page reachable', home.error); finish(); }
if ([401, 403].includes(home.status) || /vercel\.com\/(login|sso)/.test(loc(home))) bad('site is public', `got ${home.status} ${loc(home)}: Deployment Protection is probably on for this address`);
else ok('site is public', `${home.status}`);

// 2. sitemap.xml and robots.txt
const sm = await get(base + '/sitemap.xml');
const smText = sm.status === 200 ? await sm.text() : '';
(sm.status === 200 && /xml/.test(sm.headers.get('content-type') || '')) ? ok('sitemap.xml', `200 ${sm.headers.get('content-type')}`) : bad('sitemap.xml', `status ${sm.status}, type ${sm.headers.get('content-type')}`);
const paths = [...smText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => ({ loc: m[1], path: new URL(m[1]).pathname }));
paths.length >= 6 ? ok('sitemap lists pages', `${paths.length} URLs`) : bad('sitemap lists pages', `only ${paths.length} URLs`);
const rb = await get(base + '/robots.txt'); const rbText = rb.status === 200 ? await rb.text() : '';
(rb.status === 200 && /text\/plain/.test(rb.headers.get('content-type') || '') && /^Sitemap: https:\/\//m.test(rbText)) ? ok('robots.txt', 'text/plain with an https Sitemap line') : bad('robots.txt', `status ${rb.status}`);
for (const bot of ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot']) if (!rbText.includes(`User-agent: ${bot}`)) bad(`robots.txt names ${bot}`);

// 3. Every page: status, headers, canonical, one H1, compression
const secHeaders = ['content-security-policy', 'x-content-type-options', 'x-frame-options', 'referrer-policy'];
for (const p of paths) {
  const r = await get(base + p.path); const html = r.status === 200 ? await r.text() : '';
  const probs = [];
  if (r.status !== 200) probs.push(`status ${r.status}`);
  if (!/text\/html/.test(r.headers.get('content-type') || '')) probs.push('not text/html');
  if (/noindex/i.test(r.headers.get('x-robots-tag') || '')) probs.push('x-robots-tag noindex header');
  if (/<meta name="robots" content="[^"]*noindex/i.test(html)) probs.push('noindex meta tag');
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  if (!canon) probs.push('no canonical');
  else if (flag('--no-canonical-host') || local) { if (new URL(canon).pathname !== p.path) probs.push(`canonical path ${new URL(canon).pathname}`); }
  else if (canon !== p.loc.replace(/^https?:\/\/[^/]+/, base)) probs.push(`canonical ${canon}`);
  if ((html.match(/<h1\b/g) || []).length !== 1) probs.push('not exactly one h1');
  for (const h of secHeaders) if (!r.headers.get(h)) probs.push(`missing ${h}`);
  if (!local && !/(br|gzip)/.test(r.headers.get('content-encoding') || '')) probs.push('not compressed');
  probs.length ? bad(`page ${p.path}`, probs.join('; ')) : ok(`page ${p.path}`, 'ok');
}

// 4. Assets: caching, share image, icons
const js = (await (await get(base + '/')).text().catch(() => '')).match(/\/_astro\/[^"']+\.js/);
if (js) { const r = await get(base + js[0]); /immutable/.test(r.headers.get('cache-control') || '') ? ok('hashed script cached for a year', r.headers.get('cache-control')) : bad('hashed script cache-control', r.headers.get('cache-control') || 'none'); }
const og = await get(base + '/img/og-share.jpg'); const ogLen = Number(og.headers.get('content-length')) || (og.status === 200 ? (await og.arrayBuffer()).byteLength : 0);
(og.status === 200 && /image\/jpeg/.test(og.headers.get('content-type') || '') && ogLen < 300 * 1024) ? ok('share image', `${Math.round(ogLen / 1024)} KB`) : bad('share image', `status ${og.status}, ${og.headers.get('content-type')}, ${ogLen} bytes`);
for (const f of ['/favicon.ico', '/icon-192.png', '/apple-touch-icon.png']) { const r = await get(base + f); r.status === 200 && /image/.test(r.headers.get('content-type') || '') ? ok(`icon ${f}`) : bad(`icon ${f}`, `status ${r.status}`); }

// 5. A missing page must be a real 404 (a 200 here is a "soft 404" that Google punishes)
const nf = await get(base + '/this-page-does-not-exist/'); const nfHtml = await nf.text().catch(() => '');
nf.status === 404 ? ok('missing page returns 404', '') : bad('missing page returns 404', `got ${nf.status}: add the status 404 fallback described in the launch report (C9)`);
/noindex/.test(nfHtml) ? ok('404 page is noindex') : warn('404 page is noindex', 'no noindex found in the 404 body');
const up = await get(base + '/Services/'); up.status === 404 ? ok('uppercase path is 404') : warn('uppercase path is 404', `got ${up.status}`);
const st = await get(base + '/.well-known/security.txt'); st.status === 404 ? ok('no security.txt (intentional)') : warn('security.txt', `got ${st.status}; the plan is to skip this file`);

// 6. Redirects
const slashless = await get(base + '/services');
([301, 308].includes(slashless.status) && /\/services\/$/.test(loc(slashless))) ? ok('slash-less URL redirects once to the slash URL', `${slashless.status}`) : bad('slash-less redirect', `status ${slashless.status} → ${loc(slashless)}`);
const q = await get(base + '/book?for=bridal');
(([301, 308].includes(q.status)) && /for=bridal/.test(loc(q))) ? ok('redirect keeps the query string') : warn('redirect keeps the query string', `status ${q.status} → ${loc(q)}`);
if (!local) {
  const httpUrl = 'http://' + baseHost + '/'; const h = await get(httpUrl);
  ([301, 308].includes(h.status) && loc(h).startsWith('https://')) ? ok('http redirects to https', `${h.status}`) : bad('http redirects to https', `status ${h.status} → ${loc(h)}`);
  for (const [name, u] of [['www', opt('--www')], ['alias', opt('--alias')]]) if (u) {
    const r = await get(u.replace(/\/+$/, '') + '/services/?x=1');
    ([301, 308].includes(r.status) && loc(r).startsWith(base)) ? ok(`${name} redirects to ${baseHost}`, `${r.status} → ${loc(r)}`) : bad(`${name} redirects to ${baseHost}`, `status ${r.status} → ${loc(r)} (307 is not permanent)`);
  }
}
finish();

function finish() {
  const w = Math.max(...results.map((r) => r.name.length));
  for (const r of results) console.log(`${r.s}  ${r.name.padEnd(w)}  ${r.detail}`);
  const f = results.filter((r) => r.s === 'FAIL').length, wn = results.filter((r) => r.s === 'WARN').length;
  console.log(`\n${results.length - f - wn} passed, ${wn} warning(s), ${f} failed  (${base}${local ? ', local mode' : ''})`);
  process.exit(f ? 1 : 0);
}
