import { art, brands, categories, offers, popularIds, reviews, whyUs } from '../../data/catalog.js';
import tints from '../../data/sampled-colors.json';
import { db } from '../store.js';
import { icon } from '../utils/icons.js';
import { photo, stars } from '../utils/format.js';
import { productCard, bindFavs } from '../components/productCard.js';
import { offerCard } from '../components/offerCard.js';
import { ctaBand, faqSection, howItWorks, sectionHead, visitSection } from '../components/sections.js';

const tile = (c, i) => `
  <a class="cat${i === 0 ? ' cat--feature' : ''}" href="/products.html?category=${c.id}" data-reveal style="--i:${i};--tint:var(--tint-${c.tint})">
    <img src="${photo(c.photo, i === 0 ? 560 : 480, i === 0 ? 700 : 360)}" alt="" width="480" height="360" loading="lazy" decoding="async">
    <span class="cat__row"><span class="cat__name">${c.name}</span><span class="cat__arrow">${icon('arrow', { size: 16 })}</span></span>
  </a>`;

const review = (r) => `
  <figure class="review" data-reveal>
    <span class="review__mark" aria-hidden="true">“</span>
    <blockquote>${r.text}</blockquote>
    <figcaption>
      <span class="review__who"><span class="review__avatar" aria-hidden="true">${r.name[0]}</span><span><strong>${r.name}</strong><small>${r.city}</small></span></span>
      ${stars(r.stars)}
    </figcaption>
  </figure>`;

const viewAll = (href, label) => `<a class="link-arrow" href="${href}">${label} ${icon('arrow', { size: 13 })}</a>`;

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
      <img src="${photo('hero', 1600, 700)}" width="1600" height="700" alt="" fetchpriority="high">
      <div class="hero__badge"><small>Up to</small><strong data-count="30" data-suffix="%">30%</strong><small>on selected products</small></div>
    </div>
  </section>

  <section class="section" id="categories">
    <div class="container">
      ${sectionHead({ eyebrow: 'Shop by category', title: 'Explore Our Categories', text: 'Find the perfect appliance for your home, from kitchen to laundry and beyond.', action: viewAll('/products.html', 'View All') })}
      <div class="cats" data-stagger>${categories.map(tile).join('')}</div>
    </div>
  </section>

  <section class="section section--tight" id="brands">
    <div class="container">
      ${sectionHead({ eyebrow: 'Top brands', title: 'We Deal With Trusted Brands', text: 'Original products. Full warranty. Best service.', action: viewAll('/brands.html', 'View All Brands') })}
      <div class="brands" data-stagger>${brands.map((b) => `<a class="brand" href="/products.html?brand=${b.name}" data-reveal aria-label="${b.name} products"><img src="${art.brand(b.id)}" alt="${b.name}" width="140" height="56" loading="lazy"></a>`).join('')}</div>
    </div>
  </section>

  <section class="section section--flush">
    <div class="container offers" data-stagger>${offers.map((o) => offerCard(o)).join('')}</div>
  </section>

  <section class="section" id="popular">
    <div class="container">
      ${sectionHead({ eyebrow: 'Our products', title: 'Popular Products', text: 'Best selling home appliances for a modern lifestyle.', action: viewAll('/products.html', 'Visit the store') })}
      <div class="pgrid pgrid--compact" data-stagger>${popular.map((p) => productCard(p)).join('')}</div>
    </div>
  </section>

  <section class="why-band" id="why">
    <div class="container why">
      <div class="why__media" data-reveal><img src="${photo('living', 1000, 750)}" width="1000" height="750" loading="lazy" alt="Bright living room with a sofa and a refrigerator"></div>
      <div class="why__body">
        <h2 data-reveal>Why Choose Us?</h2>
        <p data-reveal>We are committed to giving you the best shopping experience.</p>
        <div class="why__grid" data-stagger>${whyUs.map((w, i) => `
          <div class="why__item" data-reveal><span class="why__num">0${i + 1}</span><strong>${w.title}</strong><span>${w.text}</span></div>`).join('')}
        </div>
      </div>
    </div>
  </section>

  ${howItWorks()}

  <section class="section section--soft">
    <div class="container">
      ${sectionHead({ eyebrow: 'Reviews', title: 'What Our Customers Say', text: 'Real people. Real experiences.', action: viewAll('/contact.html', 'Share your feedback') })}
      <div class="reviews" data-stagger>${reviews.map(review).join('')}</div>
    </div>
  </section>

  ${faqSection()}

  ${ctaBand()}

  ${visitSection()}`;
  bindFavs(document.querySelector('#main'));
}
