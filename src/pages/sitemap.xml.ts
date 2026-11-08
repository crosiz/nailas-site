import dates from '../data/lastmod.json';

// Each page's lastmod comes from src/data/lastmod.json, not from the build date: search engines only trust a date
// that really is when the page's content last changed. Update a page's date when its text, prices, structured
// data or links change. A page missing from that file stops the build rather than getting an invented date.
const PAGES = ['/', '/services/', '/bridal/', '/academy/', '/contact/', '/book/', '/privacy/'];

// The home page slideshow photos are loaded by script, so list them here to make sure they are found as images.
// Photos placed straight in the HTML are found without help.
const IMAGES: Record<string, string[]> = {
  '/': ['/img/hero-ivory.webp', '/img/hero-lehenga.webp', '/img/hero-beige.webp', '/img/hero-rose.webp'],
};

export const GET = ({ site }: { site?: URL }) => {
  const abs = (p: string) => new URL(p, site).href;
  const urls = PAGES.map((p) => {
    const lastmod = (dates as Record<string, string>)[p];
    if (!lastmod) throw new Error(`sitemap.xml: add "${p}" to src/data/lastmod.json (the date its content last really changed)`);
    const images = (IMAGES[p] ?? []).map((i) => `\n    <image:image><image:loc>${abs(i)}</image:loc></image:image>`).join('');
    return `  <url>\n    <loc>${abs(p)}</loc>\n    <lastmod>${lastmod}</lastmod>${images}\n  </url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
