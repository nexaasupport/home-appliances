// Slices the reference mockup (docs/reference-home.png, 1024x1536) into web assets under public/img.
// Re-run with: node scripts/slice-assets.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const SRC = 'docs/reference-home.png';
const OUT = 'public/img';
const img = sharp(SRC);
const raw = await img.clone().raw().toBuffer({ resolveWithObject: true });
const { width: W, channels: C } = raw.info;
const px = (x, y) => { const i = (Math.round(y) * W + Math.round(x)) * C; return [raw.data[i], raw.data[i + 1], raw.data[i + 2]]; };
const hex = ([r, g, b]) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

const colors = {};
async function crop(name, [x, y, w, h], { scale = 2, fmt = 'webp', bg = true, unheart = false } = {}) {
  let pipe = img.clone().extract({ left: Math.round(x), top: Math.round(y), width: Math.round(w), height: Math.round(h) });
  if (unheart) { // paint over the mockup's baked-in heart icon (top-right); the live one is HTML
    const patch = await sharp({ create: { width: 20, height: 12, channels: 3, background: { r: 254, g: 254, b: 254 } } }).png().toBuffer();
    const patched = await sharp(await pipe.png().toBuffer()).composite([{ input: patch, left: Math.round(w) - 20, top: 2 }]).png().toBuffer(); // flatten before resize
    pipe = sharp(patched);
  }
  await pipe
    .resize(Math.round(w * scale), Math.round(h * scale), { kernel: 'lanczos3' })
    [fmt]({ quality: 90 }).toFile(`${OUT}/${name}.${fmt}`);
  if (bg) colors[name] = hex(px(x + 3, y + 3)); // sampled corner colour so CSS tiles blend with the crop
}

// hero scene (right side only: the text and nav are rebuilt as live HTML)
await crop('hero', [400, 42, 624, 233], { scale: 2.4 });

// categories: product art from each tinted tile
const catNames = ['refrigerators', 'washing-machines', 'air-conditioners', 'televisions', 'kitchen-appliances', 'small-appliances', 'air-coolers', 'fans', 'water-heaters'];
for (const [i, n] of catNames.entries()) await crop(`cat/${n}`, [89 + i * 96.6 + 4, 349, 80, 62]);

// brand wordmarks
const brandC = [124, 213, 298, 380, 464, 558, 635, 728, 820, 903];
const brandN = ['samsung', 'lg', 'whirlpool', 'ifb', 'panasonic', 'haier', 'godrej', 'bosch', 'hitachi', 'voltas'];
for (const [i, n] of brandN.entries()) await crop(`brand/${n}`, [brandC[i] - 32, 530, 64, 26], { scale: 3, bg: false });

// offers art (right side of each banner)
await crop('offer/festival', [200, 590, 167, 124]);
await crop('offer/exchange', [500, 590, 147, 124]);
await crop('offer/bank', [796, 590, 144, 124]);

// popular products
const prodN = ['fridge', 'washer', 'tv', 'ac', 'mixer', 'cooler'];
for (const [i, n] of prodN.entries()) await crop(`prod/${n}`, [89 + i * 146.6 + 8, 788, 112, 78], { scale: 3, unheart: true });

// why-us photo, avatars, map
await crop('why', [90, 1008, 240, 120], { scale: 3 });
for (const [i, x] of [115, 397, 689].entries()) await crop(`people/${i + 1}`, [x - 17, 1201, 34, 34], { scale: 4, bg: false });
// map: replace the baked-in store name with the live brand name (change NAME/ADDRESS below to rebrand)
{
  const NAME = 'Nexaa', ADDRESS = '123, Anna Salai, Coimbatore - 641001';
  const base = await img.clone().extract({ left: 515, top: 1290, width: 424, height: 149 })
    .resize(1018, 358, { kernel: 'lanczos3' }).png().toBuffer();
  const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1018" height="358">
    <rect x="410" y="106" width="276" height="78" rx="14" fill="#fff"/>
    <text x="428" y="139" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="700" fill="#0b2a55">${NAME}</text>
    <text x="428" y="163" font-family="Arial, Helvetica, sans-serif" font-size="13.5" fill="#6b7793">${ADDRESS}</text></svg>`);
  await sharp(base).composite([{ input: label }]).webp({ quality: 90 }).toFile(`${OUT}/map.webp`);
}

writeFileSync('src/data/sampled-colors.json', JSON.stringify(colors, null, 1));
console.log('done', Object.keys(colors).length);
