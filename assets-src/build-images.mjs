// Makes the resized logos, the structured-data logo, the three schema photos and the share image.
// Run it by hand when a source photo or the logo changes (the results are committed in public/img):
//
//   node assets-src/build-images.mjs        (needs only `sharp`, which comes with Astro)
//
// The browser and phone icons have their own script: assets-src/build-icons.mjs
//
// Inputs:  assets-src/brand-mono.webp, brand-word.webp (full-size logo files),
//          assets-src/d-gold-hands.webp, d-red-jewel.webp (full-size photos),
//          public/img/hero-ivory.webp, hero-rose.webp
// Outputs: public/img/brand-mono.webp, brand-word.webp   (resized to what the pages can show, about 3x)
//          public/img/logo-512.png                       (square logo on white, for the `logo` field in the structured data)
//          public/img/schema-{1x1,4x3,16x9}.jpg          (the three shapes Google asks for in the business `image` field)
//          public/img/og-share.jpg                       (1200x630 link-preview card: logo plus one portrait)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const img = (f) => path.join(root, 'public/img', f);
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(1) + ' KB';
const jpeg = { quality: 84, mozjpeg: true };

// ---- 1. logos: the masters are 600px and 1000px wide but shown at 40-180px ----
await sharp(path.join(root, 'assets-src/brand-mono.webp')).resize({ width: 260 }).webp({ quality: 88, effort: 6, alphaQuality: 100 }).toFile(img('brand-mono.webp'));
await sharp(path.join(root, 'assets-src/brand-word.webp')).resize({ width: 480 }).webp({ quality: 88, effort: 6, alphaQuality: 100 }).toFile(img('brand-word.webp'));
for (const f of ['brand-mono.webp', 'brand-word.webp']) { const m = await sharp(img(f)).metadata(); console.log(f, `${m.width}x${m.height}`, kb(img(f))); }

// ---- 1b. logo for the structured data: Google wants a square-ish PNG/JPEG of at least 112x112 that reads on white ----
{
  const mark = await sharp(path.join(root, 'assets-src/brand-mono.webp')).resize({ width: 400, height: 400, fit: 'inside' }).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 3, background: '#ffffff' } }).composite([{ input: mark, gravity: 'centre' }]).png({ compressionLevel: 9 }).toFile(img('logo-512.png'));
  console.log('logo-512.png 512x512', kb(img('logo-512.png')));
}

// ---- 2. photos for the structured data in 1:1, 4:3 and 16:9 (cropped from the studio's own photos) ----
await sharp(img('hero-ivory.webp')).extract({ left: 0, top: 40, width: 736, height: 736 }).jpeg(jpeg).toFile(img('schema-1x1.jpg'));
await sharp(path.join(root, 'assets-src/d-gold-hands.webp')).extract({ left: 0, top: 31, width: 980, height: 735 }).jpeg(jpeg).toFile(img('schema-4x3.jpg'));
await sharp(path.join(root, 'assets-src/d-red-jewel.webp')).extract({ left: 100, top: 0, width: 1081, height: 608 }).jpeg(jpeg).toFile(img('schema-16x9.jpg'));
for (const f of ['schema-1x1.jpg', 'schema-4x3.jpg', 'schema-16x9.jpg']) { const m = await sharp(img(f)).metadata(); console.log(f, `${m.width}x${m.height}`, kb(img(f))); }

// ---- 3. share card, 1200x630: the logo large on cream at the left, one portrait of the studio's work at the right ----
// No headline: link previews already show the page title and description under the image.
{
  const W = 1200, H = 630, pw = 640;
  const photo = await sharp(img('hero-rose.webp')).resize(pw, H, { fit: 'cover', position: 'top' }).png().toBuffer();
  const mono = await sharp(img('brand-mono.webp')).resize({ height: 150 }).png().toBuffer();
  const word = await sharp(img('brand-word.webp')).resize({ width: 330 }).png().toBuffer();
  const wordMeta = await sharp(word).metadata();
  const monoW = Math.round(150 * 260 / 240);
  const cx = (W - pw) / 2;
  const bg = Buffer.from(`<svg width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf1ea"/><stop offset="1" stop-color="#f2ded2"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`);
  const edge = Buffer.from(`<svg width="40" height="${H}"><defs><linearGradient id="e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f2ded2" stop-opacity="1"/><stop offset="1" stop-color="#f2ded2" stop-opacity="0"/></linearGradient></defs><rect width="40" height="${H}" fill="url(#e)"/></svg>`);
  await sharp(bg).composite([
    { input: photo, left: W - pw, top: 0 },
    { input: edge, left: W - pw, top: 0 },
    { input: mono, left: Math.round(cx - monoW / 2), top: 170 },
    { input: word, left: Math.round(cx - wordMeta.width / 2), top: 352 },
  ]).jpeg({ quality: 86, mozjpeg: true }).toFile(img('og-share.jpg'));
  const m = await sharp(img('og-share.jpg')).metadata();
  console.log('og-share.jpg', `${m.width}x${m.height}`, kb(img('og-share.jpg')));
}
