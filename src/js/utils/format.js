import { PHOTOS, site } from '../../data/catalog.js';
import { icon } from './icons.js';

export const inr = (n) => `${n < 0 ? '-' : ''}₹${Math.abs(Number(n)).toLocaleString('en-IN')}`;

/** Optimised Unsplash URL (WebP, cropped). Returns '' when there is no photo. */
export const photo = (key, w = 600, h) => {
  const id = PHOTOS[key];
  if (!id) return '';
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&fm=webp&q=75&w=${w}${h ? `&h=${h}` : ''}`;
};

/** <img> with photo, or an SVG glyph tile when no photo exists for that item. */
export const media = ({ photoKey, iconName, alt, w = 600, h, cls = '', eager = false }) =>
  photoKey
    ? `<img class="${cls}" src="${photo(photoKey, w, h)}" srcset="${photo(photoKey, Math.round(w / 2), h && Math.round(h / 2))} ${Math.round(w / 2)}w, ${photo(photoKey, w, h)} ${w}w" sizes="(max-width: 640px) 50vw, ${Math.round(w / 2)}px" width="${w}" height="${h || Math.round(w * 0.75)}" alt="${alt}" ${eager ? '' : 'loading="lazy" decoding="async"'}>`
    : `<span class="glyph ${cls}" role="img" aria-label="${alt}">${icon(iconName, { size: 56 })}</span>`;

export const waLink = (text) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const enquire = (p) => waLink(`Hi, I'm interested in ${p.name} (${inr(p.price)}). Is it available?`);

export const tel = () => `tel:${site.phone.replace(/\s/g, '')}`;

export const stars = (n) =>
  `<span class="stars" role="img" aria-label="${n} out of 5">${Array.from({ length: 5 }, (_, i) => icon('star', { size: 14, cls: i < Math.round(n) ? 'is-on' : '' })).join('')}</span>`;
