import { defineConfig } from 'astro/config';

// The public address of the site. It feeds canonical links, the sitemap, robots.txt and the social-share image
// URLs. Set SITE_URL on the host (for example a staging address) to override it without touching the code.
const site = (process.env.SITE_URL || 'https://nailasbeautystudio.com').replace(/\/+$/, '');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
});
