import { art, brands, offers, services } from '../../data/catalog.js';
import tints from '../../data/sampled-colors.json';
import { icon } from '../utils/icons.js';
import { waLink } from '../utils/format.js';

const hero = (title, text) =>
  `<section class="page-hero"><div class="container"><h1>${title}</h1><p>${text}</p></div></section>`;

export function renderOffers() {
  document.querySelector('#main').innerHTML = `${hero('Special Offers', 'Get the best deals on top brands.')}
  <section class="section"><div class="container offers offers--stack" data-stagger>
    ${offers.map((o) => `
    <article class="offer offer--${o.id}" style="--bg:${tints[`offer/${o.id}`]}" data-reveal>
      <div class="offer__copy"><h3>${o.title}</h3><p>${o.text}</p>
        <a class="offer__btn" href="${waLink(`Hi, tell me more about: ${o.title}`)}" target="_blank" rel="noopener">${o.cta} ${icon('arrow', { size: 12 })}</a></div>
      <img class="offer__art" src="${art.offer(o.id)}" alt="" width="334" height="248" loading="lazy">
    </article>`).join('')}
  </div></section>`;
}

export function renderBrands() {
  document.querySelector('#main').innerHTML = `${hero('Our Brands', 'We deal with the most trusted brands.')}
  <section class="section"><div class="container brands brands--page" data-stagger>
    ${brands.map((b) => `<a class="brand brand--lg" href="/products.html?brand=${b.name}" data-reveal aria-label="${b.name} products"><img src="${art.brand(b.id)}" alt="${b.name}" width="204" height="78" loading="lazy"></a>`).join('')}
  </div></section>`;
}

export function renderServices() {
  document.querySelector('#main').innerHTML = `${hero('Our Services', 'We provide complete support for your appliances.')}
  <section class="section"><div class="container services" data-stagger>
    ${services.map((s) => `
    <article class="service" data-reveal><span class="service__icon">${icon(s.icon, { size: 28 })}</span><h3>${s.title}</h3><p>${s.text}</p></article>`).join('')}
  </div></section>`;
}
