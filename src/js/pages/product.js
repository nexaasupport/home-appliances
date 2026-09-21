import { categories } from '../../data/catalog.js';
import { db } from '../store.js';
import { icon } from '../utils/icons.js';
import { enquire, inr, media, photo, stars, tel } from '../utils/format.js';
import { productCard, bindFavs } from '../components/productCard.js';
import { assurance, ctaBand } from '../components/sections.js';

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
  // same category first, then same brand, then the best rated: always a full row of four
  const pool = db.products().filter((x) => x.id !== p.id);
  const rank = (x) => (x.category === p.category ? 2 : 0) + (x.brand === p.brand ? 1 : 0);
  const related = [...pool].sort((a, b) => rank(b) - rank(a) || b.rating - a.rating).slice(0, 4);

  main.innerHTML = `
  <section class="section section--tight">
    <div class="container">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/index.html">Home</a>${icon('arrow', { size: 12 })}<a href="/products.html?category=${p.category}">${cat?.name ?? 'Products'}</a>${icon('arrow', { size: 12 })}<span aria-current="page">${p.name}</span></nav>
      <div class="detail">
        <div class="gallery" data-reveal>
          <div class="gallery__main">${media({ photoKey: p.photo, image: p.image, iconName: cat?.icon ?? 'box', alt: p.name, w: 900, h: 700, eager: true })}</div>
        </div>
        <div class="detail__info" data-reveal>
          <h1>${p.name}</h1>
          <p class="detail__meta">Brand: <strong>${p.brand}</strong> ${stars(p.rating)} <span>${p.rating}</span></p>
          <p class="detail__price">${inr(p.price)}</p>
          <p class="stock stock--${status}">${icon(status === 'out' ? 'close' : 'check', { size: 16 })} ${label}</p>
          <ul class="detail__spec">${Object.entries(p.specs).slice(0, 4).map(([k, v]) => `<li>${icon('check', { size: 16 })}<span><b>${k}:</b> ${v}</span></li>`).join('')}</ul>
          <div class="detail__cta">
            <a class="btn btn--whatsapp btn--lg" href="${enquire(p)}" data-enq="${p.id}" target="_blank" rel="noopener">${icon('whatsapp', { size: 18 })} Enquire on WhatsApp</a>
            <a class="btn btn--primary btn--lg" href="${tel()}">${icon('phone', { size: 18 })} Call Now</a>
          </div>
          <ul class="detail__perks">
            <li>${icon('truck', { size: 18 })}<span><strong>Delivery & installation</strong> arranged on request</span></li>
            <li>${icon('shield', { size: 18 })}<span><strong>Genuine product</strong> with brand warranty</span></li>
            <li>${icon('refresh', { size: 18 })}<span><strong>Exchange</strong> your old appliance</span></li>
          </ul>
          <p class="detail__emi">${icon('wallet', { size: 16 })} EMI available: about ${inr(Math.round(p.price / 12 / 10) * 10)}/month over 12 months. Ask us for exact plans.</p>
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

      <div class="store__assure">${assurance()}</div>

      ${related.length ? `<h2 class="related__title" data-reveal>You may also like</h2><div class="pgrid pgrid--compact pgrid--four" data-stagger>${related.map((r) => productCard(r)).join('')}</div>` : ''}
    </div>
  </section>
  ${ctaBand({ title: `Interested in the ${p.name}?`, text: 'Message us for the best price, availability and delivery date. We usually reply within minutes.' })}`;

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
  bindFavs(main);
}
