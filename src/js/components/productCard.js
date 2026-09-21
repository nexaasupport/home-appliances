import { icon } from '../utils/icons.js';
import { enquire, inr, media, stars } from '../utils/format.js';
import { art, categories } from '../../data/catalog.js';

const iconFor = (p) => categories.find((c) => c.id === p.category)?.icon ?? 'box';

// Products with a mockup cutout render on white; others use a cropped Unsplash photo.
const picture = (p) =>
  p.cut
    ? `<img class="pcard__cut" src="${art.prod(p.cut)}" alt="" width="336" height="234" loading="lazy" decoding="async">`
    : media({ photoKey: p.photo, iconName: iconFor(p), alt: '', w: 480, h: 360 });

export const productCard = (p, { reveal = true } = {}) => `
  <article class="pcard${p.cut ? ' pcard--cut' : ''}" ${reveal ? 'data-reveal' : ''}>
    <button class="pcard__fav" type="button" aria-label="Save ${p.name}" aria-pressed="false">${icon('heart', { size: 18 })}</button>
    <a class="pcard__media" href="/product.html?id=${p.id}" tabindex="-1" aria-hidden="true">${picture(p)}</a>
    <div class="pcard__body">
      <h3 class="pcard__title"><a href="/product.html?id=${p.id}">${p.name}</a></h3>
      <p class="pcard__brand">${p.brand} ${p.cut ? '' : stars(p.rating)}</p>
      <p class="pcard__price">${inr(p.price)}</p>
      <div class="pcard__actions">
        <a class="link-detail" href="/product.html?id=${p.id}">${icon('phone', { size: 13 })} View Details</a>
        <a class="btn btn--whatsapp btn--block" href="${enquire(p)}" target="_blank" rel="noopener">${icon('whatsapp', { size: 16 })} Enquire on WhatsApp</a>
      </div>
    </div>
  </article>`;

export const bindFavs = (root = document) =>
  root.addEventListener('click', (e) => {
    const b = e.target.closest('.pcard__fav');
    if (!b) return;
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('is-on', on);
  });
