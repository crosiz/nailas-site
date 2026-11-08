// Draws the browser and phone icons from the logo master. Run it by hand when the logo changes:
//
//   node assets-src/build-icons.mjs        (needs only `sharp`, which comes with Astro)
//
// Outputs: public/favicon.ico           16, 32 and 48 px frames on a rounded cream tile
//          public/icon-192.png          192 px, same tile
//          public/apple-touch-icon.png  180 px, square, because iOS rounds the corners itself
//
// The logo's strokes are very thin and pale, so on a bare page they fade away at tab size. Here the mark is
// drawn in deeper tones on the site's cream, and each small frame is drawn at 8x with a little extra stroke
// weight before it is shrunk, which keeps the N and the lipstick readable at 16 px.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const master = path.join(root, 'assets-src/brand-mono.webp');
const TILE = '#f2ded2';
const SCALE = 8;
const EXTRA_STROKE = { 16: 0.7, 32: 0.45, 48: 0.3 }; // in output pixels; the large icons need none
const DARKEN = { 16: 0.74, 32: 0.78, 48: 0.8 };      // brightness of the mark; the large icons stay close to the logo

async function icon(size, { fill, radius }) {
  const big = size * SCALE;
  const markSize = Math.round(big * fill);
  const mark = await sharp(master).resize({ width: markSize, height: markSize, fit: 'inside', kernel: 'mitchell' })
    .modulate({ brightness: DARKEN[size] || 0.92, saturation: 1.25 }).png().toBuffer();
  const { width, height } = await sharp(mark).metadata();
  const left = Math.round((big - width) / 2), top = Math.round((big - height) / 2);
  const grow = Math.round((EXTRA_STROKE[size] || 0) * SCALE);
  const layers = [];
  if (grow) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) layers.push({ input: mark, left: left + Math.round(dx * grow), top: top + Math.round(dy * grow) });
  layers.push({ input: mark, left, top });
  const r = Math.round(big * radius);
  const tile = Buffer.from(`<svg width="${big}" height="${big}"><rect width="${big}" height="${big}" rx="${r}" ry="${r}" fill="${TILE}"/></svg>`);
  const drawn = await sharp(tile).composite(layers).png().toBuffer();
  const out = sharp(drawn).resize(size, size, { kernel: 'mitchell' });
  return (radius ? out : out.flatten({ background: TILE })).png({ compressionLevel: 9 }).toBuffer(); // a square icon has no transparent corners: iOS would paint them black
}

const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map((s) => icon(s, { fill: 0.9, radius: 0.22 })));
const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e[0] = s; e[1] = s; e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(frames[i].length, 8); e.writeUInt32LE(offset, 12);
  offset += frames[i].length;
  return e;
});
fs.writeFileSync(path.join(root, 'public/favicon.ico'), Buffer.concat([head, ...entries, ...frames]));
fs.writeFileSync(path.join(root, 'public/icon-192.png'), await icon(192, { fill: 0.8, radius: 0.22 }));
fs.writeFileSync(path.join(root, 'public/apple-touch-icon.png'), await icon(180, { fill: 0.78, radius: 0 }));

for (const f of ['favicon.ico', 'icon-192.png', 'apple-touch-icon.png']) console.log(f, (fs.statSync(path.join(root, 'public', f)).size / 1024).toFixed(1) + ' KB');
