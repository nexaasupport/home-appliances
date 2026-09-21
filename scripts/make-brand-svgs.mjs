// Generates crisp vector wordmarks for the brand strip: text is converted to outlines from Poppins,
// so the SVGs render identically everywhere (no font loading inside <img>).
// These are typographic wordmarks, not the brands' official logos: drop an official SVG at
// public/img/brand/<id>.svg (same filename) to replace any of them.
// Run: node scripts/make-brand-svgs.mjs
import opentype from 'opentype.js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const load = (file) => {
  const b = readFileSync(file);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const dir = 'node_modules/@fontsource/poppins/files';
const fonts = { 600: load(`${dir}/poppins-latin-600-normal.woff`), 700: load(`${dir}/poppins-latin-700-normal.woff`) };

function outline(text, opts) {
  // opentype.js can emit NaN for a rare glyph/weight combination: fall back to the other weight rather than ship a broken path
  for (const weight of [opts.weight ?? 700, opts.weight === 600 ? 700 : 600]) {
    const o = outlineWith(text, { ...opts, weight });
    if (!o.d.includes('NaN')) return o;
  }
  throw new Error(`no clean outline for ${text}`);
}

function outlineWith(text, { weight = 700, size = 48, tracking = 0 }) {
  const font = fonts[weight];
  let x = 0;
  const paths = [];
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    paths.push(g.getPath(x, 0, size));
    x += (g.advanceWidth * size) / font.unitsPerEm + tracking;
  }
  const box = paths.reduce((b, p) => {
    const q = p.getBoundingBox();
    return { x1: Math.min(b.x1, q.x1), y1: Math.min(b.y1, q.y1), x2: Math.max(b.x2, q.x2), y2: Math.max(b.y2, q.y2) };
  }, { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity });
  return { d: paths.map((p) => p.toPathData(2)).join(' '), box };
}

const marks = [
  { id: 'samsung', text: 'SAMSUNG', color: '#1428a0', tracking: 4 },
  { id: 'lg', text: 'LG', color: '#ffffff', disc: '#a50034', size: 40 },
  { id: 'whirlpool', text: 'Whirlpool', color: '#2a2f3a', weight: 600 },
  { id: 'ifb', text: 'IFB', color: '#3a3f4a', tracking: 3, size: 54 },
  { id: 'panasonic', text: 'Panasonic', color: '#0041c0', weight: 600 },
  { id: 'haier', text: 'Haier', color: '#0b5cad', size: 56 },
  { id: 'godrej', text: 'godrej', color: '#c9252c', weight: 600, size: 54 },
  { id: 'bosch', text: 'BOSCH', color: '#e20015', tracking: 3 },
  { id: 'hitachi', text: 'HITACHI', color: '#15171c', weight: 600, tracking: 5 },
  { id: 'voltas', text: 'VOLTAS', color: '#0057a8', tracking: 3, skew: -9 },
];

mkdirSync('public/img/brand', { recursive: true });
for (const m of marks) {
  const o = outline(m.text, { weight: m.weight ?? 700, size: m.size ?? 48, tracking: m.tracking ?? 0 });
  const w = o.box.x2 - o.box.x1, h = o.box.y2 - o.box.y1;
  let svg;
  if (m.disc) {
    const r = Math.max(w, h) / 2 + 16;
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${2 * r} ${2 * r}" width="${2 * r}" height="${2 * r}" role="img" aria-label="LG"><circle cx="${r}" cy="${r}" r="${r}" fill="${m.disc}"/><path fill="${m.color}" transform="translate(${r - w / 2 - o.box.x1} ${r - h / 2 - o.box.y1})" d="${o.d}"/></svg>`;
  } else {
    const pad = 6, skew = m.skew ? `skewX(${m.skew})` : '';
    const tw = w + pad * 2, th = h + pad * 2;
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tw.toFixed(1)} ${th.toFixed(1)}" width="${tw.toFixed(1)}" height="${th.toFixed(1)}" role="img" aria-label="${m.text}"><g transform="translate(${(pad - o.box.x1).toFixed(2)} ${(pad - o.box.y1).toFixed(2)}) ${skew}"><path fill="${m.color}" d="${o.d}"/></g></svg>`;
  }
  writeFileSync(`public/img/brand/${m.id}.svg`, svg);
}
console.log('brand svgs:', marks.length);
