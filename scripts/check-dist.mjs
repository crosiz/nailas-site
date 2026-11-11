// Runs after every build (`npm run build`) and on demand (`npm run check`). It fails the build if the output
// would ship something broken, so a bad deploy is stopped on the host instead of reaching visitors.
//
//   node scripts/check-dist.mjs            check dist/
//   node scripts/check-dist.mjs <dir>      check another folder
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dist = path.resolve(args.find((a) => !a.startsWith('--')) || 'dist');
if (!fs.existsSync(dist)) { console.error(`check-dist: ${dist} does not exist. Run the build first.`); process.exit(1); }

const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : files.push(p); } })(dist);
const rel = (f) => path.relative(dist, f).replaceAll('\\', '/');
const read = (f) => fs.readFileSync(f, 'utf8');
const pages = files.filter((f) => f.endsWith('.html'));
const problems = [];
const bad = (msg) => problems.push(msg);
// The address every page should carry in a normal build (keep in step with the default in astro.config.mjs). A build that
// deliberately uses another address (SITE_URL for a temporary launch on the .vercel.app alias) is allowed to differ.
const EXPECTED_ORIGIN = 'https://nailasbeautystudio.com';
const buildOrigin = (() => { const p = path.join(dist, 'sitemap.xml'); return fs.existsSync(p) ? ((read(p).match(/<loc>(https?:\/\/[^/<]+)/) || [])[1] || '') : ''; })();

const idCache = new Map();
const idsIn = (f) => { if (!idCache.has(f)) idCache.set(f, new Set([...read(f).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))); return idCache.get(f); };
const toFile = (url, from) => {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return from;
  let p = clean.startsWith('/') ? path.join(dist, clean) : path.join(path.dirname(from), clean);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  return p;
};

// Every page the site is supposed to have
for (const required of ['index.html', 'services/index.html', 'bridal/index.html', 'academy/index.html', 'contact/index.html', 'book/index.html', 'privacy/index.html', '404.html', 'robots.txt', 'sitemap.xml', 'favicon.ico', 'icon-192.png', 'apple-touch-icon.png'])
  if (!fs.existsSync(path.join(dist, required))) bad(`missing output file: ${required}`);

const phones = new Set(), waNumbers = new Set();
const SITE_TS = fs.readFileSync(new URL('../src/data/site.ts', import.meta.url), 'utf8');
const WA_NUMBER = '+' + (SITE_TS.match(/wa\.me\/(\d+)/) || [])[1]; // the one WhatsApp number, from src/data/site.ts
const CALL_NUMBER = (SITE_TS.match(/PHONE = '(\+\d+)'/) || [])[1]; // the one call number, from src/data/site.ts
const seen = { titles: new Map(), descs: new Map() };
const canon = new Map(); // page file -> its canonical address
for (const f of pages) {
  const s = read(f), name = rel(f);

  // links and assets
  for (const m of s.matchAll(/\s(?:href|src|data-src)="([^"]*)"/g)) {
    const u = m[1];
    if (u === '' || u === '#') continue;
    if (/^(mailto:|data:|javascript:)/.test(u)) { if (u.startsWith('javascript:')) bad(`${name}: javascript: link`); continue; }
    if (u.startsWith('tel:')) { phones.add(u.slice(4)); continue; }
    if (u.startsWith('https://wa.me/')) { waNumbers.add('+' + u.slice('https://wa.me/'.length).split('?')[0]); continue; }
    if (/^https?:/.test(u)) { if (u.startsWith('http://')) bad(`${name}: insecure http:// link ${u}`); continue; }
    if (u.startsWith('#')) { if (!idsIn(f).has(u.slice(1))) bad(`${name}: dangling in-page link ${u}`); continue; }
    const target = toFile(u, f);
    if (!fs.existsSync(target)) { bad(`${name}: broken link/asset "${u}"`); continue; }
    const frag = u.split('#')[1];
    if (frag && target.endsWith('.html') && !idsIn(target).has(frag)) bad(`${name}: "${u}" points to a section that does not exist`);
  }
  for (const m of s.matchAll(/<use[^>]*href="#([^"]+)"/g)) if (!idsIn(f).has(m[1])) bad(`${name}: icon #${m[1]} is not defined`);
  for (const m of s.matchAll(/<img\b[^>]*>/g)) if (!/\salt=/.test(m[0])) bad(`${name}: image without alt text: ${m[0].slice(0, 70)}`);
  for (const m of s.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) if (!/rel="[^"]*noopener/.test(m[0])) bad(`${name}: target=_blank link without rel=noopener`);

  // search and sharing basics
  const title = (s.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title || !title.trim()) bad(`${name}: empty <title>`);
  if (!/<meta name="description" content="[^"]{20,}"/.test(s)) bad(`${name}: missing or too-short meta description`);
  const h1s = (s.match(/<h1\b/g) || []).length;
  const display = (s.match(/<h1 class="pb__title">([\s\S]*?)<\/h1>/) || [])[1];
  if (display) { const txt = display.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); if (txt.length > 32) bad(`${name}: the page heading "${txt}" is ${txt.length} characters; keep it to about 30 so it stays on two lines (put extra keywords in the lead sentence)`); }
  if (h1s !== 1) bad(`${name}: expected exactly one <h1>, found ${h1s}`);
  if (name !== '404.html') {
    if (!/<link rel="canonical" href="https:\/\/[^"]+"/.test(s)) bad(`${name}: canonical link missing or not https`);
    if (/localhost|127\.0\.0\.1/.test((s.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '')) bad(`${name}: canonical points at localhost`);
  } else {
    if (!/<meta name="robots" content="noindex">/.test(s)) bad('404.html: should be noindex');
    if (/rel="canonical"/.test(s)) bad('404.html: should not carry a canonical link (it would point at a URL that does not exist)');
  }

  // share preview: the og:image must exist, and be a real file crawlers can fetch
  const og = (s.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];
  if (!og) bad(`${name}: no og:image`);
  else { const p = new URL(og).pathname; if (!fs.existsSync(path.join(dist, p))) bad(`${name}: og:image ${p} is not in the build`); }

  // titles/descriptions should be distinct per page and not so long that Google cuts them
  if (title && title.length > 70) bad(`${name}: <title> is ${title.length} characters (keep it to about 60-70)`);
  const descText = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (descText.length > 170) bad(`${name}: meta description is ${descText.length} characters (keep it to about 160)`);
  seen.titles.set(title, [...(seen.titles.get(title) || []), name]);
  seen.descs.set(descText, [...(seen.descs.get(descText) || []), name]);

  // pages listed in the sitemap must be indexable; no page may point at a host that is not the production address
  { const c = (s.match(/<link rel="canonical" href="([^"]*)"/) || [])[1]; if (c) canon.set(name, c); }
  if (name !== '404.html' && /<meta name="robots" content="[^"]*noindex/i.test(s)) bad(`${name}: is noindex, but every built page except the 404 is listed in the sitemap (a noindex page must not be listed)`);
  if (buildOrigin === EXPECTED_ORIGIN && /https?:\/\/www\.nailasbeautystudio|[a-z0-9-]+\.vercel\.app/i.test(s)) bad(`${name}: mentions a www or vercel.app address; only the apex address belongs in the pages`);

  // structured data: valid JSON, one business node with the basics, every reference resolves, breadcrumbs make sense
  const blocks = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (name === '404.html') { if (blocks.length) bad('404.html: a noindex page should not carry structured data'); }
  else if (blocks.length !== 1) bad(`${name}: expected one JSON-LD block, found ${blocks.length}`);
  else {
    let data;
    try { data = JSON.parse(blocks[0]); } catch (e) { bad(`${name}: JSON-LD is not valid JSON (${e.message})`); }
    if (data) {
      const nodes = data['@graph'] || [];
      const defined = new Set(), refs = [];
      const walk = (v) => {
        if (Array.isArray(v)) return v.forEach(walk);
        if (!v || typeof v !== 'object') return;
        const keys = Object.keys(v);
        if (v['@id'] && v['@type']) defined.add(v['@id']);
        else if (keys.length === 1 && keys[0] === '@id') refs.push(v['@id']);
        Object.values(v).forEach(walk);
      };
      walk(nodes);
      for (const r of refs) if (!defined.has(r)) bad(`${name}: JSON-LD refers to ${r}, which is not defined on the page`);
      const salon = nodes.find((n) => n['@type'] === 'BeautySalon');
      if (!salon) bad(`${name}: JSON-LD has no BeautySalon node`);
      else {
        if (!salon.name) bad(`${name}: BeautySalon has no name`);
        if (!salon.address || salon.address.addressCountry !== 'PK') bad(`${name}: BeautySalon address must be a PostalAddress with addressCountry "PK"`);
        if (!salon.telephone) bad(`${name}: BeautySalon has no telephone`);
        if (!(salon.image || []).length) bad(`${name}: BeautySalon has no image`);
        if (!salon.logo || !salon.logo.url) bad(`${name}: BeautySalon has no logo`);
        for (const img of [...(salon.image || []), salon.logo && salon.logo.url].filter(Boolean)) {
          const p = new URL(img).pathname;
          if (!fs.existsSync(path.join(dist, p))) bad(`${name}: JSON-LD image ${p} is not in the build`);
        }
        // Google requires markup to match what visitors can see. A business's own reviews never earn stars, so those stay out.
        for (const key of ['aggregateRating', 'review']) if (salon[key]) bad(`${name}: BeautySalon has "${key}": a business's own reviews are ineligible for rich results and risk a manual action`);
        const visible = s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
        if (salon.address && salon.address.postalCode && !visible.includes(String(salon.address.postalCode))) bad(`${name}: structured data has postalCode ${salon.address.postalCode} but the page does not show it`);
        if (salon.priceRange && !visible.includes(String(salon.priceRange))) bad(`${name}: structured data has priceRange "${salon.priceRange}" but the page does not show it`);
        if (salon.openingHoursSpecification && name === 'contact/index.html') {
          const specs = [].concat(salon.openingHoursSpecification);
          // the page may write 20:00 as "8:00 pm" or "8 pm"
          const shown = (t) => {
            const [h, m] = t.split(':').map(Number), mm = String(m).padStart(2, '0'), ap = h < 12 ? 'am' : 'pm', h12 = h % 12 || 12, low = visible.toLowerCase();
            return visible.includes(t) || [`${h12}:${mm} ${ap}`, `${h12}:${mm}${ap}`, ...(mm === '00' ? [`${h12} ${ap}`] : [])].some((v) => low.includes(v));
          };
          for (const spec of specs) for (const t of [spec.opens, spec.closes].filter(Boolean)) if (!shown(t)) bad(`${name}: structured data has opening time ${t} but the page does not show it`);
        }
        if (salon.openingHoursSpecification && name !== 'contact/index.html' && !/Hours/i.test(visible)) bad(`${name}: opening hours are in the structured data but this page shows no hours`);      }
      for (const crumb of nodes.filter((n) => n['@type'] === 'BreadcrumbList')) {
        const items = crumb.itemListElement || [];
        if (items.length < 2) bad(`${name}: BreadcrumbList needs at least two items`);
        items.forEach((it, i) => { if (it.position !== i + 1) bad(`${name}: BreadcrumbList positions are not 1, 2, 3...`); });
      }
      if (name === 'index.html' && !nodes.some((n) => n['@type'] === 'WebSite')) bad('index.html: home page JSON-LD should include WebSite');
    }
    // visible name, address and phone, as crawlable text, on every indexable page
    const nap = (s.match(/<address class="footer__nap">[\s\S]*?<\/address>/) || [''])[0];
    if (!(/A&amp;K Plaza[\s\S]*Sangam Market[\s\S]*Sector I-8\/3/.test(nap) && nap.includes('tel:' + CALL_NUMBER))) bad(`${name}: footer address block (name, A&K Plaza, Sangam Market, I-8/3, phone) is missing`);
  }
  if (/Sangum/i.test(s)) bad(`${name}: uses the spelling "Sangum"; the site spells it "Sangam" everywhere`);
  if (!/<a href="\/privacy\/">Privacy<\/a>/.test(s)) bad(`${name}: the footer has no link to the privacy page`);

  // no wording left over from the design's sample prices
  if (/sample-note|sample prices?|sample starting/i.test(s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, ''))) bad(`${name}: still contains "sample price" wording`);
}

// The Services page is the price list. Every row needs a price or a label, and the page must not lose its rows.
{
  const p = path.join(dist, 'services/index.html');
  const svc = fs.existsSync(p) ? read(p) : '';
  const rows = [...svc.matchAll(/<span class="menu-item__price">(.*?)<\/span>/g)].map((m) => m[1]);
  if (rows.length < 100) bad(`services/index.html: only ${rows.length} price rows found (the list has about 125)`);
  for (const r of rows) if (!/\d|free|consultation|by appointment/i.test(r)) bad(`services/index.html: a row has no price or label ("${r}")`);
  if (/undefined|NaN/.test(svc.replace(/<script[\s\S]*?<\/script>/g, ''))) bad('services/index.html: contains "undefined" or "NaN" (a price did not render)');
}

for (const [what, map] of Object.entries(seen)) for (const [value, where] of map) if (where.length > 1) bad(`the same ${what === 'titles' ? '<title>' : 'meta description'} is used on ${where.join(', ')}`);

// one phone number everywhere (catches a typo in a single link)
if (!CALL_NUMBER || !/^\+\d+$/.test(WA_NUMBER)) bad('src/data/site.ts must define PHONE and a wa.me link');
if (phones.size > 1 || (phones.size === 1 && !phones.has(CALL_NUMBER))) bad(`call links must all use ${CALL_NUMBER} (from src/data/site.ts), found: ${[...phones].join(', ')}`);
if (waNumbers.size > 1 || (waNumbers.size === 1 && !waNumbers.has(WA_NUMBER))) bad(`WhatsApp links must all use ${WA_NUMBER} (from src/data/site.ts), found: ${[...waNumbers].join(', ')}`);

// sitemap: every URL must be a built page, on the configured host
const sitemap = fs.existsSync(path.join(dist, 'sitemap.xml')) ? read(path.join(dist, 'sitemap.xml')) : '';
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!locs.length) bad('sitemap.xml lists no pages');
for (const loc of locs) {
  const p = new URL(loc).pathname;
  if (!fs.existsSync(path.join(dist, p, 'index.html'))) bad(`sitemap.xml lists ${loc}, which is not a built page`);
  if (/localhost|127\.0\.0\.1/.test(loc)) bad(`sitemap.xml contains a localhost URL: ${loc}`);
}
// every sitemap address is exactly its page's canonical; a production build must carry the real address
for (const loc of locs) {
  const pth = new URL(loc).pathname, n = pth === '/' ? 'index.html' : pth.slice(1) + 'index.html';
  if (canon.get(n) !== loc) bad(`sitemap.xml: ${loc} is not the same address as that page's canonical (${canon.get(n)})`);
}
if (process.env.VERCEL_ENV === 'production' && process.env.ALLOW_OTHER_ORIGIN !== '1')
  for (const c of [...canon.values()].slice(0, 1)) if (new URL(c).origin !== EXPECTED_ORIGIN) bad(`a production build must use ${EXPECTED_ORIGIN} but a page says ${new URL(c).origin}. Fix SITE_URL, or set ALLOW_OTHER_ORIGIN=1 only for a temporary launch without the domain.`);
const vercelJson = new URL('../vercel.json', import.meta.url);
if (fs.existsSync(vercelJson) && /x-robots-tag/i.test(fs.readFileSync(vercelJson, 'utf8')) && /noindex/i.test(fs.readFileSync(vercelJson, 'utf8'))) bad('vercel.json sets a noindex header, which would hide the whole site from search');

// sitemap details: only the tags Google and Bing use, an honest-looking lastmod on every URL, every built page listed, images exist
{
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(new Date()); // the studio's calendar day, not UTC (which is still "yesterday" for the first five hours of a Pakistani morning)
  if (/<changefreq>|<priority>/.test(sitemap)) bad('sitemap.xml: changefreq and priority are ignored by Google and Bing; remove them');
  for (const m of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = (m[1].match(/<loc>([^<]+)<\/loc>/) || [])[1];
    const lm = (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
    if (!lm) bad(`sitemap.xml: ${loc} has no lastmod (add its date to src/data/lastmod.json)`);
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(lm) || Number.isNaN(Date.parse(lm))) bad(`sitemap.xml: ${loc} has an invalid lastmod "${lm}"`);
    else if (lm > today) bad(`sitemap.xml: ${loc} has a lastmod in the future (${lm})`);
    for (const im of m[1].matchAll(/<image:loc>([^<]+)<\/image:loc>/g)) { const p = new URL(im[1]).pathname; if (!fs.existsSync(path.join(dist, p))) bad(`sitemap.xml: image ${p} is not in the build`); }
  }
  for (const f of pages) { const n = rel(f); if (n === '404.html') continue; const p = '/' + n.replace(/index\.html$/, ''); if (!locs.some((l) => new URL(l).pathname === p)) bad(`${n} is a built page but is not in sitemap.xml`); }
}
const robots = fs.existsSync(path.join(dist, 'robots.txt')) ? read(path.join(dist, 'robots.txt')) : '';
if (!/^Sitemap: https:\/\//m.test(robots)) bad('robots.txt has no https Sitemap line');
// the crawlers that feed Google, Bing, ChatGPT search, Claude and Perplexity must not be shut out by a stray rule
{
  const groups = robots.split(/\r?\n\s*\r?\n/).map((g) => g.split(/\r?\n/).filter((l) => l && !l.startsWith('#')));
  const rulesFor = (agent) => groups.filter((g) => g.some((l) => l.toLowerCase() === `user-agent: ${agent}`.toLowerCase())).flat();
  for (const agent of ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User']) {
    const rules = rulesFor(agent);
    if (!rules.length) bad(`robots.txt: no explicit group for ${agent}`);
    else if (rules.some((l) => /^disallow:\s*\/\s*$/i.test(l))) bad(`robots.txt: ${agent} is blocked, so the site cannot appear in that search or answer engine`);
  }
  if (groups.some((g) => g.some((l) => /^user-agent:\s*\*\s*$/i.test(l)) && g.some((l) => /^disallow:\s*\/\s*$/i.test(l)))) bad('robots.txt: "User-agent: *" is set to Disallow: /, which hides the whole site');
}

if (problems.length) {
  console.error(`\ncheck-dist: ${problems.length} problem${problems.length > 1 ? 's' : ''} in the build:\n` + problems.map((p) => '  - ' + p).join('\n') + '\n');
  process.exit(1);
}
console.log(`check-dist: build OK — ${pages.length} pages, links, assets, icons, sitemap and contact number all check out.`);
