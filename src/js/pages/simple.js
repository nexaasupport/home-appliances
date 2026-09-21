import { art, brands, offers, services } from '../../data/catalog.js';
import { db } from '../store.js';
import { icon } from '../utils/icons.js';
import { photo, waLink } from '../utils/format.js';
import { offerCard } from '../components/offerCard.js';
import { productCard, bindFavs } from '../components/productCard.js';
import { assurance, ctaBand, pageHero, sectionHead } from '../components/sections.js';

const grid = (products) => `<div class="pgrid pgrid--compact pgrid--four" data-stagger>${products.map((p) => productCard(p)).join('')}</div>`;

// ---------------------------------------------------------------- Offers
export function renderOffers() {
  const picks = db.products().filter((p) => p.stock > 0 && p.rating >= 4.3).sort((a, b) => a.price - b.price).slice(0, 4);
  const claim = [
    { icon: 'search', title: 'Choose your appliance', text: 'Pick any product from the store, or ask us to suggest one for your budget.' },
    { icon: 'whatsapp', title: 'Tell us the offer', text: 'Message us the offer you want (festival, exchange or bank card). We confirm it on that exact model.' },
    { icon: 'tag', title: 'We apply it at billing', text: 'The discount is applied on your invoice, then delivery and installation are arranged.' },
  ];
  document.querySelector('#main').innerHTML = `
  ${pageHero({ eyebrow: 'Deals', title: 'Special offers', text: 'Festival savings, exchange bonuses and bank discounts on the brands you trust.', crumbs: [['Home', '/index.html'], ['Offers']] })}

  <section class="section">
    <div class="container">
      ${sectionHead({ eyebrow: 'Running now', title: 'Choose the offer that suits you.', text: 'Offers can be combined on many models. Ask us which ones apply to the appliance you want.' })}
      <div class="offers offers--page" data-stagger>${offers.map((o) => offerCard(o, waLink(`Hi, tell me more about: ${o.title}`))).join('')}</div>
    </div>
  </section>

  <section class="section section--soft">
    <div class="container">
      ${sectionHead({ eyebrow: 'Deal picks', title: 'Best value right now.', text: 'Top-rated appliances at friendly prices, all in stock.', action: `<a class="link-arrow" href="/products.html?sort=low">Browse by price ${icon('arrow', { size: 13 })}</a>` })}
      ${grid(picks)}
    </div>
  </section>

  <section class="section">
    <div class="container">
      ${sectionHead({ eyebrow: 'How to claim', title: 'Three easy steps.', text: 'No coupons or forms. We handle the paperwork.' })}
      <ol class="steps steps--three" data-stagger>
        ${claim.map((s, i) => `<li class="step" data-reveal><span class="step__num">0${i + 1}</span><span class="step__icon">${icon(s.icon, { size: 24 })}</span><h3>${s.title}</h3><p>${s.text}</p></li>`).join('')}
      </ol>
      <p class="fineprint" data-reveal>Offers are subject to brand and bank terms, product availability and may change without notice. Please confirm the exact offer on your chosen model with our team.</p>
    </div>
  </section>
  ${ctaBand({ title: 'Ask us which offer fits your purchase.', text: 'Share the product you want and how you plan to pay. We will apply the best deal available.' })}`;
  bindFavs(document.querySelector('#main'));
}

// ---------------------------------------------------------------- Brands
export function renderBrands() {
  const all = db.products();
  const counts = all.reduce((m, p) => ((m[p.brand.toLowerCase()] = (m[p.brand.toLowerCase()] ?? 0) + 1), m), {});
  const names = new Set(brands.map((b) => b.id));
  const featured = all.filter((p) => names.has(p.brand.toLowerCase()) && p.stock > 0).sort((a, b) => b.rating - a.rating).slice(0, 4);
  document.querySelector('#main').innerHTML = `
  ${pageHero({ eyebrow: 'Brands', title: 'Brands we deal with', text: 'Original products from leading names, sourced through authorised channels and backed by full brand warranty.', crumbs: [['Home', '/index.html'], ['Brands']] })}

  <section class="section">
    <div class="container">
      ${sectionHead({ eyebrow: 'Shop by brand', title: 'Pick a brand to see what is in store.', text: 'Tap any brand to browse its appliances. Not listed yet? We can order it for you.' })}
      <div class="bcards" data-stagger>
        ${brands.map((b) => {
          const n = counts[b.id] ?? 0;
          return `<a class="bcard" href="/products.html?brand=${encodeURIComponent(b.name)}" data-reveal aria-label="${b.name}: ${n ? `${n} products in store` : 'available on request'}">
            <span class="bcard__logo"><img src="${art.brand(b.id)}" alt="" width="140" height="56" loading="lazy"></span>
            <span class="bcard__meta"><strong>${n ? `${n} product${n === 1 ? '' : 's'}` : 'On request'}</strong><small>${n ? 'in store now' : 'we can order it'}</small></span>
            <span class="bcard__arrow">${icon('arrow', { size: 16 })}</span>
          </a>`;
        }).join('')}
      </div>
    </div>
  </section>

  <section class="section section--soft">
    <div class="container">
      ${sectionHead({ eyebrow: 'Top rated', title: 'Popular from these brands.', action: `<a class="link-arrow" href="/products.html">Visit the store ${icon('arrow', { size: 13 })}</a>` })}
      ${grid(featured)}
    </div>
  </section>

  <section class="section section--tight"><div class="container">${assurance()}</div></section>
  ${ctaBand({ title: "Don't see your brand?", text: 'We can source many more models through our brand partners. Ask us and we will confirm availability and price.' })}`;
  bindFavs(document.querySelector('#main'));
}

// ---------------------------------------------------------------- Services
const details = [
  { id: 'delivery-installation', photo: 'ac', title: 'Delivery & installation', text: 'Your appliance arrives safely and is set up properly, so it works perfectly from day one.',
    points: ['Careful delivery to your doorstep', 'Installation by trained technicians for ACs, washing machines, TVs and more', 'A quick demo of features before we leave'] },
  { id: 'warranty-repair', photo: 'washer2', title: 'Warranty & repair support', text: 'If something goes wrong, you deal with one team instead of chasing the brand.',
    points: ['Help registering your brand warranty', 'Repair and service booking on WhatsApp or by phone', 'Honest advice on repair versus replacement'] },
  { id: 'exchange-emi', photo: 'tv', title: 'Exchange & easy EMI', text: 'Upgrade sooner and spread the cost, with clear numbers before you commit.',
    points: ['Exchange value for your old appliance', 'EMI and finance options on most products', 'Transparent pricing with no hidden charges'] },
];

export function renderServices() {
  document.querySelector('#main').innerHTML = `
  ${pageHero({ eyebrow: 'Services', title: 'Support at every step', text: 'From the day you choose an appliance to the years you use it, we look after delivery, installation, repairs, exchange and finance.', crumbs: [['Home', '/index.html'], ['Services']] })}

  <section class="section">
    <div class="container">
      ${sectionHead({ eyebrow: 'What we do', title: 'Everything after the sale, handled.' })}
      <div class="services" data-stagger>
        ${services.map((s) => `
        <article class="service" id="${s.id}" data-reveal>
          <span class="service__icon">${icon(s.icon, { size: 28 })}</span><h3>${s.title}</h3><p>${s.text}</p>
          <a class="link-detail" href="${waLink(`Hi, I need help with: ${s.title}`)}" target="_blank" rel="noopener">Ask about this</a>
        </article>`).join('')}
      </div>
    </div>
  </section>

  <section class="section section--soft">
    <div class="container features">
      ${details.map((d, i) => `
      <article class="feature${i % 2 ? ' feature--flip' : ''}" id="${d.id}" data-reveal>
        <div class="feature__media"><img src="${photo(d.photo, 900, 675)}" width="900" height="675" alt="" loading="lazy"></div>
        <div class="feature__body">
          <span class="eyebrow">0${i + 1}</span>
          <h2>${d.title}</h2>
          <p>${d.text}</p>
          <ul class="ticks">${d.points.map((p) => `<li>${icon('check', { size: 18 })} ${p}</li>`).join('')}</ul>
          <a class="btn btn--whatsapp" href="${waLink(`Hi, I would like to know more about: ${d.title}`)}" target="_blank" rel="noopener">${icon('whatsapp', { size: 18 })} Ask on WhatsApp</a>
        </div>
      </article>`).join('')}
    </div>
  </section>

  <section class="section section--tight"><div class="container">${assurance()}</div></section>
  ${ctaBand({ title: 'Need a technician or a quote?', text: 'Tell us the appliance and the issue. We will arrange installation, repair or an exchange valuation.' })}`;
}
