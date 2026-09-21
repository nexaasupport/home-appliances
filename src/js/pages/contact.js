import { site } from '../../data/catalog.js';
import { icon } from '../utils/icons.js';
import { tel, waLink } from '../utils/format.js';
import { toast } from '../utils/motion.js';

export function renderContact() {
  document.querySelector('#main').innerHTML = `
  <section class="page-hero"><div class="container"><h1>Get in Touch</h1><p>We are here to help. Visit our store or reach us any time.</p></div></section>
  <section class="section"><div class="container contact">
    <div class="contact__info" data-reveal>
      <ul>
        <li>${icon('phone', { size: 22 })}<div><strong>Call us</strong><a href="${tel()}">${site.phone}</a></div></li>
        <li>${icon('whatsapp', { size: 22 })}<div><strong>WhatsApp</strong><a href="${waLink('Hi!')}" target="_blank" rel="noopener">Chat now</a></div></li>
        <li>${icon('pin', { size: 22 })}<div><strong>Visit</strong><span>${site.address}</span></div></li>
        <li>${icon('clock', { size: 22 })}<div><strong>Hours</strong><span>${site.hours}</span></div></li>
        <li>${icon('mail', { size: 22 })}<div><strong>Email</strong><a href="mailto:${site.email}">${site.email}</a></div></li>
      </ul>
      <iframe title="Store location map" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=76.93%2C10.99%2C77.02%2C11.05&layer=mapnik&marker=11.0168%2C76.9558"></iframe>
    </div>
    <form class="contact__form" id="contact-form" novalidate data-reveal>
      <h2>Send us a message</h2>
      <div class="field"><label for="name">Name <span aria-hidden="true">*</span></label><input class="input" id="name" name="name" autocomplete="name" required><span class="error" data-for="name"></span></div>
      <div class="field"><label for="phone">Phone <span aria-hidden="true">*</span></label><input class="input" id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required><span class="error" data-for="phone"></span></div>
      <div class="field"><label for="message">Message <span aria-hidden="true">*</span></label><textarea class="input" id="message" name="message" required></textarea><span class="error" data-for="message"></span></div>
      <button class="btn btn--primary btn--lg" type="submit">Send via WhatsApp ${icon('arrow', { size: 18 })}</button>
    </form>
  </div></section>`;

  const form = document.querySelector('#contact-form');
  const rules = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your name.' : ''),
    phone: (v) => (/^[+\d][\d\s-]{8,14}$/.test(v.trim()) ? '' : 'Enter a valid phone number, e.g. +91 98765 43210.'),
    message: (v) => (v.trim().length < 5 ? 'Tell us a little more so we can help.' : ''),
  };
  const check = (el) => {
    const msg = rules[el.name](el.value);
    el.setAttribute('aria-invalid', String(Boolean(msg)));
    form.querySelector(`[data-for=${el.name}]`).textContent = msg;
    return !msg;
  };
  form.querySelectorAll('.input').forEach((el) => el.addEventListener('blur', () => check(el)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('.input')];
    const bad = fields.filter((el) => !check(el));
    if (bad.length) return bad[0].focus();
    const d = Object.fromEntries(new FormData(form));
    open(waLink(`Hi, I'm ${d.name} (${d.phone}). ${d.message}`), '_blank', 'noopener');
    toast('Opening WhatsApp with your message…');
    form.reset();
  });
}
