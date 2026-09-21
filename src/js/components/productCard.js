import { icon } from '../utils/icons.js';
import { enquire, inr, media, stars } from '../utils/format.js';
import { categories } from '../../data/catalog.js';
import { db } from '../store.js';

const iconFor = (p) => categories.find((c) => c.id === p.category)?.icon ?? 'box';
const picture = (p, w = 480, h = 360) => media({ photoKey: p.photo, image: p.image, iconName: iconFor(p), alt: '', w, h });

/** Compact card used on the home page and "You may also like". */
export const productCard = (p, { reveal = true } = {}) => `
  <article class="pcard" ${reveal ? 'data-reveal' : ''}>
    <button class="pcard__fav" type="button" aria-label="Save ${p.name}" aria-pressed="false">${icon('heart', { size: 18 })}</button>
    <a class="pcard__media" href="/product.html?id=${p.id}" tabindex="-1" aria-hidden="true">${picture(p)}</a>
    <div class="pcard__body">
      <p class="pcard__brand">${p.brand} ${stars(p.rating)}</p>
      <h3 class="pcard__title"><a href="/product.html?id=${p.id}">${p.name}</a></h3>
      <p class="pcard__price">${inr(p.price)}</p>
      <div class="pcard__actions">
        <a class="link-detail" href="/product.html?id=${p.id}">Details</a>
        <a class="pcard__wa" href="${enquire(p)}" data-enq="${p.id}" target="_blank" rel="noopener" aria-label="Enquire about ${p.name} on WhatsApp">${icon('whatsapp', { size: 20 })}</a>
      </div>
    </div>
  </article>`;

const STOCK = {
  in: { label: 'In stock', cls: 'in' },
  low: { label: 'Low stock', cls: 'low' },
  out: { label: 'Out of stock', cls: 'out' },
};

/** Larger store card: badges, key specs, EMI hint and clear CTAs. Works in grid and list layouts. */
export const storeCard = (p) => {
  const st = db.status(p);
  const specs = Object.entries(p.specs).slice(0, 3);
  const emi = Math.round(p.price / 12 / 10) * 10;
  return `
  <article class="scard" data-reveal>
    <a class="scard__media" href="/product.html?id=${p.id}" aria-label="View ${p.name}">
      ${picture(p, 640, 480)}
      ${st === 'low' ? `<span class="scard__badge scard__badge--low">Only ${p.stock} left</span>` : ''}
      ${st === 'out' ? '<span class="scard__badge scard__badge--out">Out of stock</span>' : ''}
    </a>
    <button class="pcard__fav" type="button" aria-label="Save ${p.name}" aria-pressed="false">${icon('heart', { size: 18 })}</button>
    <div class="scard__body">
      <span class="scard__brand">${p.brand}</span>
      <h3 class="scard__title"><a href="/product.html?id=${p.id}">${p.name}</a></h3>
      <p class="scard__meta">${stars(p.rating)}<span>${p.rating}</span><span class="scard__stock scard__stock--${STOCK[st].cls}">${STOCK[st].label}</span></p>
      <ul class="scard__specs">${specs.map(([k, v]) => `<li><b>${k}</b> ${v}</li>`).join('')}</ul>
      <div class="scard__price"><strong>${inr(p.price)}</strong><small>EMI ≈ ${inr(emi)}/mo</small></div>
      <div class="scard__actions">
        <a class="btn btn--whatsapp" href="${enquire(p)}" data-enq="${p.id}" target="_blank" rel="noopener">${icon('whatsapp', { size: 18 })} ${st === 'out' ? 'Ask availability' : 'Enquire'}</a>
        <a class="btn btn--ghost" href="/product.html?id=${p.id}">Details</a>
      </div>
    </div>
  </article>`;
};

export const bindFavs = (root = document) =>
  root.addEventListener('click', (e) => {
    const b = e.target.closest('.pcard__fav');
    if (!b) return;
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('is-on', on);
  });
