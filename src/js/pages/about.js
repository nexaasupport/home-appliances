import { site, whyUs } from '../../data/catalog.js';
import { icon } from '../utils/icons.js';
import { photo } from '../utils/format.js';
import { ctaBand, faqSection, howItWorks, pageHero, sectionHead } from '../components/sections.js';

export function renderAbout() {
  document.querySelector('#main').innerHTML = `
  ${pageHero({ eyebrow: 'About us', title: 'Appliances, done right.', text: `${site.name} is a home appliance store built around genuine products, honest advice and service that continues long after delivery.`, crumbs: [['Home', '/index.html'], ['About us']] })}

  <section class="section" id="story">
    <div class="container split">
      <div class="split__media" data-reveal><img src="${photo('store', 1000, 800)}" width="1000" height="800" loading="lazy" alt="Appliances on display inside a bright store"></div>
      <div class="split__body">
        <span class="eyebrow" data-reveal>Our story</span>
        <h2 data-reveal>A neighbourhood store with the range of a big showroom.</h2>
        <p data-reveal>We started with a simple idea: buying a refrigerator, a washing machine or an AC should feel easy and trustworthy. So we stock leading brands, explain your options plainly, and stay with you through delivery, installation and warranty.</p>
        <p data-reveal>Whether you walk in, call, or message us on WhatsApp, you speak to people who know the products and will recommend what suits your home and budget, not just what is on offer.</p>
        <ul class="ticks" data-reveal>
          <li>${icon('check', { size: 18 })} Authorised brand channels only</li>
          <li>${icon('check', { size: 18 })} Clear pricing, no pressure</li>
          <li>${icon('check', { size: 18 })} Delivery, installation and service in one place</li>
        </ul>
        <div class="split__cta" data-reveal><a class="btn btn--primary" href="/products.html">Explore the store ${icon('arrow', { size: 16 })}</a><a class="btn btn--ghost" href="/contact.html">Talk to us</a></div>
      </div>
    </div>
  </section>

  <section class="section section--soft" id="values">
    <div class="container">
      ${sectionHead({ eyebrow: 'What we stand for', title: 'Why customers choose Nexaa', text: 'Four promises we keep on every order.' })}
      <div class="values" data-stagger>
        ${whyUs.map((w, i) => `
        <article class="value" data-reveal><span class="value__icon">${icon(w.icon, { size: 26 })}</span><span class="value__num">0${i + 1}</span><h3>${w.title}</h3><p>${w.text}. We make it easy to compare, ask questions and choose with confidence.</p></article>`).join('')}
      </div>
    </div>
  </section>

  ${howItWorks()}
  ${faqSection()}
  ${ctaBand({ title: 'Visit us or message us today.', text: 'Come see the appliances in person, or send a message and we will reply with availability and the best price.' })}`;
}
