import { art, brands, categories, offers, popularIds, reviews, site, whyUs } from '../../data/catalog.js';
import tints from '../../data/sampled-colors.json';
import { db } from '../store.js';
import { icon } from '../utils/icons.js';
import { stars, tel } from '../utils/format.js';
import { productCard, bindFavs } from '../components/productCard.js';

const tile = (c, i) => `
  <a class="cat" href="/products.html?category=${c.id}" data-reveal style="--i:${i};--tint:${tints[`cat/${c.id}`]}">
    <img src="${art.cat(c.id)}" alt="" width="160" height="124" loading="lazy" decoding="async">
    <span class="cat__name">${c.name}</span>
    <span class="cat__arrow">${icon('arrow', { size: 12 })}</span>
  </a>`;

const offerCard = (o) => `
  <article class="offer offer--${o.id}" style="--bg:${tints[`offer/${o.id}`]}" data-reveal>
    <div class="offer__copy">
      <h3>${o.title.replace(' Offers', '<br>Offers').replace('Festival ', 'Festival<br>')}</h3>
      <p>${o.text}</p>
      <a class="offer__btn" href="/offers.html">${o.cta} ${icon('arrow', { size: 12 })}</a>
    </div>
    <img class="offer__art" src="${art.offer(o.id)}" alt="" width="334" height="248" loading="lazy" decoding="async">
  </article>`;

const review = (r, i) => `
  <figure class="review" data-reveal>
    <img class="review__avatar" src="${art.avatar(i)}" alt="" width="46" height="46" loading="lazy">
    <div>
      <blockquote>“${r.text}”</blockquote>
      <figcaption><strong>${r.name}</strong><span>${r.city}</span>${stars(r.stars)}</figcaption>
    </div>
  </figure>`;

export function renderHome() {
  const popular = popularIds.map((id) => db.product(id)).filter(Boolean);
  document.querySelector('#main').innerHTML = `
  <section class="hero" style="--wall:${tints.hero}">
    <div class="container hero__inner">
      <div class="hero__copy">
        <span class="chip" data-hero style="--d:0">${icon('pin', { size: 13 })} Trusted Home Appliance Store in Tamil Nadu</span>
        <h1 data-hero style="--d:1">Top Brands. Best Quality.<br>For Your Home.</h1>
        <p data-hero style="--d:2">Wide range of home appliances from leading brands with expert advice, great offers and reliable service.</p>
        <div class="hero__cta" data-hero style="--d:3">
          <a class="btn btn--primary" href="/products.html">Explore Products ${icon('arrow', { size: 16 })}</a>
          <a class="btn btn--ghost" href="#visit">${icon('pin', { size: 16 })} Visit Our Store</a>
        </div>
      </div>
    </div>
    <div class="hero__scene" aria-hidden="true">
      <img src="/img/hero.webp" width="1498" height="559" alt="" fetchpriority="high">
      <div class="hero__badge"><small>Up to</small><strong data-count="30" data-suffix="%">30%</strong><small>on selected products</small></div>
    </div>
  </section>

  <section class="section" id="categories">
    <div class="container">
      <header class="section__head" data-reveal>
        <div><span class="eyebrow">Shop by category</span><h2>Explore Our Categories</h2><p>Find the perfect appliance for your home, from kitchen to laundry and beyond.</p></div>
        <a class="link-arrow" href="/products.html">View All ${icon('arrow', { size: 13 })}</a>
      </header>
      <div class="cats" data-stagger>${categories.map(tile).join('')}</div>
    </div>
  </section>

  <section class="section section--tight" id="brands">
    <div class="container">
      <header class="section__head" data-reveal>
        <div><span class="eyebrow">Top brands</span><h2>We Deal With Trusted Brands</h2><p>Original products. Full warranty. Best service.</p></div>
        <a class="link-arrow" href="/brands.html">View All Brands ${icon('arrow', { size: 13 })}</a>
      </header>
      <div class="brands" data-stagger>${brands.map((b) => `<a class="brand" href="/products.html?brand=${b.name}" data-reveal aria-label="${b.name} products"><img src="${art.brand(b.id)}" alt="${b.name}" width="204" height="78" loading="lazy"></a>`).join('')}</div>
    </div>
  </section>

  <section class="section section--flush">
    <div class="container offers" data-stagger>${offers.map(offerCard).join('')}</div>
  </section>

  <section class="section section--tight" id="popular">
    <div class="container">
      <header class="section__head" data-reveal>
        <div><span class="eyebrow">Our products</span><h2>Popular Products</h2><p>Best selling home appliances for a modern lifestyle.</p></div>
        <a class="link-arrow" href="/products.html">View All Products ${icon('arrow', { size: 13 })}</a>
      </header>
      <div class="pgrid pgrid--compact" data-stagger>${popular.map((p) => productCard(p)).join('')}</div>
    </div>
  </section>

  <section class="why-band" id="about">
    <div class="container why">
      <div class="why__media" data-reveal><img src="/img/why.webp" width="720" height="360" loading="lazy" alt="Living room with a black refrigerator and sofa"></div>
      <div class="why__body">
        <h2 data-reveal>Why Choose Us?</h2>
        <p data-reveal>We are committed to giving you the best shopping experience.</p>
        <div class="why__grid" data-stagger>${whyUs.map((w) => `
          <div class="why__item" data-reveal><span class="why__icon">${icon(w.icon, { size: 20 })}</span><div><strong>${w.title}</strong><span>${w.text}</span></div></div>`).join('')}
        </div>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="container">
      <header class="section__head" data-reveal>
        <div><h2>What Our Customers Say</h2><p>Real people. Real experiences.</p></div>
        <a class="link-arrow" href="/contact.html">View All Reviews ${icon('arrow', { size: 13 })}</a>
      </header>
      <div class="reviews" data-stagger>${reviews.map(review).join('')}</div>
    </div>
  </section>

  <section class="section section--tight" id="visit">
    <div class="container visit" data-reveal>
      <div class="visit__info">
        <h2>Visit Our Store</h2>
        <p>Come and experience our products in person. Our team is always ready to help you.</p>
        <ul>
          <li>${icon('pin', { size: 16 })}<span>${site.address}</span></li>
          <li>${icon('phone', { size: 16 })}<a href="${tel()}">${site.phone}</a></li>
          <li>${icon('mail', { size: 16 })}<a href="mailto:${site.email}">${site.email}</a></li>
          <li>${icon('clock', { size: 16 })}<span>${site.hours}</span></li>
        </ul>
        <a class="btn btn--light btn--sm" href="https://maps.google.com/?q=Anna+Salai+Coimbatore" target="_blank" rel="noopener">Get Directions ${icon('arrow', { size: 14 })}</a>
      </div>
      <a class="visit__map" href="https://maps.google.com/?q=Anna+Salai+Coimbatore" target="_blank" rel="noopener" aria-label="Open store location in Google Maps"><img src="/img/map.webp" width="1018" height="358" loading="lazy" alt="Map showing the Nexaa store on Anna Salai, Coimbatore"></a>
    </div>
  </section>`;
  bindFavs(document.querySelector('#main'));
}
