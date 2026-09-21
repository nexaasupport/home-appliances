import { faqs, site, steps } from '../../data/catalog.js';
import { icon } from '../utils/icons.js';
import { photo, tel, waLink } from '../utils/format.js';

export const sectionHead = ({ eyebrow, title, text, action }) => `
  <header class="section__head" data-reveal>
    <div>${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ''}<h2>${title}</h2>${text ? `<p>${text}</p>` : ''}</div>
    ${action ?? ''}
  </header>`;

/** Four-step journey: browse -> enquire -> delivery -> support. */
export const howItWorks = () => `
  <section class="section" id="how">
    <div class="container">
      ${sectionHead({ eyebrow: 'How it works', title: 'From enquiry to installation, made simple.', text: 'A clear four-step journey, so you always know what happens next.' })}
      <ol class="steps" data-stagger>
        ${steps.map((s, i) => `
        <li class="step" data-reveal>
          <span class="step__num">0${i + 1}</span>
          <span class="step__icon">${icon(s.icon, { size: 24 })}</span>
          <h3>${s.title}</h3>
          <p>${s.text}</p>
        </li>`).join('')}
      </ol>
    </div>
  </section>`;

export const faqSection = () => `
  <section class="section section--soft" id="faq">
    <div class="container faq">
      <div class="faq__intro" data-reveal>
        <span class="eyebrow">FAQs</span>
        <h2>Questions, answered.</h2>
        <p>Can't find what you need? Our team replies fast on WhatsApp.</p>
        <a class="btn btn--whatsapp" href="${waLink('Hi! I have a question about your appliances.')}" target="_blank" rel="noopener">${icon('whatsapp', { size: 18 })} Ask on WhatsApp</a>
      </div>
      <div class="faq__list" data-stagger>
        ${faqs.map((f, i) => `
        <details class="faq__item" data-reveal ${i === 0 ? 'open' : ''}>
          <summary>${f.q}<span class="faq__icon" aria-hidden="true">${icon('plus', { size: 20 })}</span></summary>
          <p>${f.a}</p>
        </details>`).join('')}
      </div>
    </div>
  </section>`;

export const ctaBand = ({ title = 'Not sure which appliance to pick?', text = 'Tell us your budget and needs. We will suggest the right model, share the best price and arrange delivery.' } = {}) => `
  <section class="section section--tight">
    <div class="container cta" data-reveal>
      <div class="cta__copy">
        <h2>${title}</h2>
        <p>${text}</p>
        <div class="cta__actions">
          <a class="btn btn--whatsapp btn--lg" href="${waLink('Hi! Please help me choose an appliance.')}" target="_blank" rel="noopener">${icon('whatsapp', { size: 18 })} Chat on WhatsApp</a>
          <a class="btn btn--light btn--lg" href="${tel()}">${icon('phone', { size: 18 })} ${site.phone}</a>
        </div>
      </div>
      <img class="cta__img" src="${photo('store', 800, 600)}" width="800" height="600" alt="Appliances on display in a bright showroom" loading="lazy">
    </div>
  </section>`;

/** Small trust strip used above product grids. */
export const assurance = () => `
  <ul class="assure">
    <li>${icon('shield', { size: 22 })}<span><strong>Genuine products</strong><small>Brand warranty on everything</small></span></li>
    <li>${icon('truck', { size: 22 })}<span><strong>Delivery & installation</strong><small>Set up by trained technicians</small></span></li>
    <li>${icon('wallet', { size: 22 })}<span><strong>Easy EMI</strong><small>Flexible monthly plans</small></span></li>
    <li>${icon('headset', { size: 22 })}<span><strong>Human support</strong><small>WhatsApp, call or visit</small></span></li>
  </ul>`;

/** Store visit block: contact cards, actions and a map with a live "open now" badge. */
export const visitSection = () => {
  const h = new Date().getHours();
  const open = h >= 9 && h < 21; // store hours: 9 AM - 9 PM, every day
  return `
  <section class="section" id="visit">
    <div class="container store-visit">
      <div class="store-visit__info">
        <div data-reveal>
          <span class="eyebrow">Visit us</span>
          <h2>Come and see it in person.</h2>
          <p>Try the appliances, compare models side by side and get advice from our team. No appointment needed.</p>
        </div>
        <ul class="vcards" data-stagger>
          <li class="vcard" data-reveal><span class="vcard__icon">${icon('pin', { size: 20 })}</span><strong>Address</strong><span>${site.address}</span></li>
          <li class="vcard" data-reveal><span class="vcard__icon">${icon('clock', { size: 20 })}</span><strong>Opening hours</strong><span>${site.hours}</span></li>
          <li class="vcard" data-reveal><span class="vcard__icon">${icon('phone', { size: 20 })}</span><strong>Call us</strong><a href="${tel()}">${site.phone}</a></li>
          <li class="vcard" data-reveal><span class="vcard__icon">${icon('mail', { size: 20 })}</span><strong>Email</strong><a href="mailto:${site.email}">${site.email}</a></li>
        </ul>
        <div class="store-visit__actions" data-reveal>
          <a class="btn btn--primary btn--lg" href="https://maps.google.com/?q=Anna+Salai+Coimbatore" target="_blank" rel="noopener">${icon('pin', { size: 18 })} Get directions</a>
          <a class="btn btn--whatsapp btn--lg" href="${waLink('Hi! I would like to visit your store.')}" target="_blank" rel="noopener">${icon('whatsapp', { size: 18 })} WhatsApp us</a>
        </div>
      </div>
      <div class="store-visit__map" data-reveal>
        <iframe title="Store location map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.openstreetmap.org/export/embed.html?bbox=76.93%2C10.99%2C77.02%2C11.05&layer=mapnik&marker=11.0168%2C76.9558"></iframe>
        <div class="map-card">
          <img src="${photo('store', 160, 160)}" width="64" height="64" alt="" loading="lazy">
          <div>
            <strong>${site.name} Store</strong>
            <small>Anna Salai, Coimbatore</small>
            <span class="map-card__status map-card__status--${open ? 'open' : 'closed'}"><i></i>${open ? 'Open now · closes 9 PM' : 'Closed · opens 9 AM'}</span>
          </div>
        </div>
      </div>
    </div>
  </section>`;
};

/** Breadcrumb trail. items: [label, href?]; the last one is the current page. */
export const breadcrumbs = (items, cls = '') => `
  <nav class="crumbs ${cls}" aria-label="Breadcrumb">
    ${items.map(([label, href], i) => (i === items.length - 1
      ? `<span aria-current="page">${label}</span>`
      : `<a href="${href}">${label}</a>${icon('chevron', { size: 12, cls: 'crumbs__sep' })}`)).join('')}
  </nav>`;

/** Shared header for inner pages: breadcrumbs, eyebrow, title, intro and an optional action. */
export const pageHero = ({ eyebrow, title, text, crumbs, action = '' }) => `
  <section class="page-hero">
    <div class="container">
      ${breadcrumbs(crumbs, 'crumbs--hero')}
      <span class="eyebrow">${eyebrow}</span>
      <h1>${title}</h1>
      <p>${text}</p>
      ${action}
    </div>
  </section>`;
