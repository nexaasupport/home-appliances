import { categories } from '../../data/catalog.js';
import { db } from '../store.js';
import { icon } from '../utils/icons.js';
import { enquire, inr, media, photo, stars, tel } from '../utils/format.js';
import { productCard, bindFavs } from '../components/productCard.js';

export function renderProduct() {
  const id = new URLSearchParams(location.search).get('id');
  const p = db.product(id);
  const main = document.querySelector('#main');
  if (!p) {
    main.innerHTML = `<section class="section"><div class="container empty"><h1>Product not found</h1><p>It may have been removed.</p><a class="btn btn--primary" href="/products.html">Browse products</a></div></section>`;
    return;
  }
  document.title = `${p.name} | Nexaa`;
  const cat = categories.find((c) => c.id === p.category);
  const status = db.status(p);
  const label = { in: 'In Stock', low: `Only ${p.stock} left`, out: 'Out of Stock' }[status];
  const related = db.products().filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);
  const thumbs = p.photo ? [0, 1, 2].map((i) => `<button class="gallery__thumb${i === 0 ? ' is-on' : ''}" type="button" data-i="${i}" aria-label="View image ${i + 1}"><img src="${photo(p.photo, 160, 160)}" alt="" width="80" height="80" style="object-position:${['center', 'left', 'right'][i]}"></button>`).join('') : '';

  main.innerHTML = `
  <section class="section section--tight">
    <div class="container">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/index.html">Home</a>${icon('arrow', { size: 12 })}<a href="/products.html?category=${p.category}">${cat?.name ?? 'Products'}</a>${icon('arrow', { size: 12 })}<span aria-current="page">${p.name}</span></nav>
      <div class="detail">
        <div class="gallery" data-reveal>
          <div class="gallery__main">${media({ photoKey: p.photo, iconName: cat?.icon ?? 'box', alt: p.name, w: 900, h: 700, eager: true })}</div>
          <div class="gallery__thumbs">${thumbs}</div>
        </div>
        <div class="detail__info" data-reveal>
          <h1>${p.name}</h1>
          <p class="detail__meta">Brand: <strong>${p.brand}</strong> ${stars(p.rating)} <span>${p.rating}</span></p>
          <p class="detail__price">${inr(p.price)}</p>
          <p class="stock stock--${status}">${icon(status === 'out' ? 'close' : 'check', { size: 16 })} ${label}</p>
          <ul class="detail__spec">${Object.entries(p.specs).slice(0, 4).map(([k, v]) => `<li>${icon('check', { size: 16 })}<span><b>${k}:</b> ${v}</span></li>`).join('')}</ul>
          <div class="detail__cta">
            <a class="btn btn--whatsapp btn--lg" href="${enquire(p)}" target="_blank" rel="noopener">${icon('whatsapp', { size: 18 })} Enquire on WhatsApp</a>
            <a class="btn btn--primary btn--lg" href="${tel()}">${icon('phone', { size: 18 })} Call Now</a>
          </div>
        </div>
      </div>

      <div class="tabs" data-reveal>
        <div class="tabs__list" role="tablist">
          ${['Description', 'Specifications', 'Reviews'].map((t, i) => `<button role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${t}</button>`).join('')}
        </div>
        <div class="tabs__panel" role="tabpanel" id="panel-0" aria-labelledby="tab-0"><p>${p.description}</p></div>
        <div class="tabs__panel" role="tabpanel" id="panel-1" aria-labelledby="tab-1" hidden>
          <table class="spec-table"><tbody>${Object.entries(p.specs).map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table></div>
        <div class="tabs__panel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden><p>${stars(p.rating)} Rated ${p.rating} out of 5 by our customers in store.</p></div>
      </div>

      ${related.length ? `<h2 class="related__title" data-reveal>You may also like</h2><div class="pgrid pgrid--wide" data-stagger>${related.map((r) => productCard(r)).join('')}</div>` : ''}
    </div>
  </section>`;

  const tabs = [...main.querySelectorAll('[role=tab]')];
  const show = (i) => tabs.forEach((t, j) => {
    t.setAttribute('aria-selected', String(i === j));
    t.tabIndex = i === j ? 0 : -1;
    main.querySelector(`#panel-${j}`).hidden = i !== j;
  });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', (e) => {
      const n = e.key === 'ArrowRight' ? (i + 1) % 3 : e.key === 'ArrowLeft' ? (i + 2) % 3 : null;
      if (n !== null) { show(n); tabs[n].focus(); }
    });
  });
  main.querySelector('.gallery__thumbs')?.addEventListener('click', (e) => {
    const b = e.target.closest('.gallery__thumb');
    if (!b) return;
    main.querySelectorAll('.gallery__thumb').forEach((x) => x.classList.toggle('is-on', x === b));
    main.querySelector('.gallery__main img').style.objectPosition = b.querySelector('img').style.objectPosition;
  });
  bindFavs(main);
}
