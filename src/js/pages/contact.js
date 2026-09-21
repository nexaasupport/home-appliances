import { site } from '../../data/catalog.js';
import { icon } from '../utils/icons.js';
import { db } from '../store.js';
import { tel, waLink } from '../utils/format.js';
import { toast } from '../utils/motion.js';
import { faqSection, pageHero, visitSection } from '../components/sections.js';

const TOPICS = ['Product enquiry', 'Price or offer', 'Delivery & installation', 'Repair & warranty', 'Exchange / EMI', 'Something else'];

export function renderContact() {
  document.querySelector('#main').innerHTML = `
  ${pageHero({ eyebrow: 'Contact', title: 'Get in touch', text: 'Questions about a product, an offer or a repair? Message us, call or visit. We usually reply within minutes.', crumbs: [['Home', '/index.html'], ['Contact']] })}

  <section class="section">
    <div class="container contact">
      <div class="contact__side" data-stagger>
        <a class="caction caction--wa" href="${waLink('Hi! I have a question.')}" target="_blank" rel="noopener" data-reveal>
          <span class="caction__icon">${icon('whatsapp', { size: 24 })}</span>
          <span><strong>WhatsApp</strong><small>Fastest way to reach us</small></span><span class="caction__go">${icon('arrow', { size: 18 })}</span>
        </a>
        <a class="caction" href="${tel()}" data-reveal>
          <span class="caction__icon">${icon('phone', { size: 24 })}</span>
          <span><strong>Call us</strong><small>${site.phone}</small></span><span class="caction__go">${icon('arrow', { size: 18 })}</span>
        </a>
        <a class="caction" href="mailto:${site.email}" data-reveal>
          <span class="caction__icon">${icon('mail', { size: 24 })}</span>
          <span><strong>Email</strong><small>${site.email}</small></span><span class="caction__go">${icon('arrow', { size: 18 })}</span>
        </a>
        <div class="caction caction--static" data-reveal>
          <span class="caction__icon">${icon('clock', { size: 24 })}</span>
          <span><strong>Store hours</strong><small>${site.hours}</small></span>
        </div>
      </div>

      <div class="contact__card" data-reveal>
        <form class="contact__form" id="contact-form" novalidate>
          <div><h2>Send us a message</h2><p>We will continue the conversation on WhatsApp so you get a quick answer.</p></div>
          <div class="field"><label for="topic">What is this about?</label>
            <select class="input" id="topic" name="topic">${TOPICS.map((t) => `<option>${t}</option>`).join('')}</select></div>
          <div class="row2">
            <div class="field"><label for="name">Name <span aria-hidden="true">*</span></label><input class="input" id="name" name="name" autocomplete="name" required><span class="error" data-for="name"></span></div>
            <div class="field"><label for="phone">Phone <span aria-hidden="true">*</span></label><input class="input" id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required><span class="error" data-for="phone"></span></div>
          </div>
          <div class="field"><label for="message">Message <span aria-hidden="true">*</span></label><textarea class="input" id="message" name="message" required placeholder="e.g. I am looking for a 1.5 ton inverter AC under ₹45,000"></textarea><span class="error" data-for="message"></span></div>
          <button class="btn btn--primary btn--lg btn--block" type="submit">${icon('whatsapp', { size: 18 })} Continue on WhatsApp</button>
        </form>
        <div class="contact__done" id="contact-done" hidden role="status">
          <span class="contact__done-icon">${icon('check', { size: 32 })}</span>
          <h2>Thanks, we have your message.</h2>
          <p>WhatsApp should open with your message ready to send. If it did not, use the button below.</p>
          <a class="btn btn--whatsapp btn--lg" id="done-link" href="#" target="_blank" rel="noopener">${icon('whatsapp', { size: 18 })} Open WhatsApp</a>
          <button class="link-detail" type="button" id="again">Send another message</button>
        </div>
      </div>
    </div>
  </section>

  ${visitSection()}
  ${faqSection()}`;

  const form = document.querySelector('#contact-form');
  const done = document.querySelector('#contact-done');
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
  form.querySelectorAll('.input[required]').forEach((el) => el.addEventListener('blur', () => check(el)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [...form.querySelectorAll('.input[required]')].filter((el) => !check(el));
    if (bad.length) return bad[0].focus();
    const d = Object.fromEntries(new FormData(form));
    db.addEnquiry({ source: 'contact-form', name: d.name, phone: d.phone, topic: d.topic, message: d.message });
    const link = waLink(`Hi, I'm ${d.name} (${d.phone}). Topic: ${d.topic}. ${d.message}`);
    document.querySelector('#done-link').href = link;
    open(link, '_blank', 'noopener');
    form.hidden = true;
    done.hidden = false;
    done.querySelector('h2').focus?.();
    toast('Message ready on WhatsApp');
  });
  document.querySelector('#again').addEventListener('click', () => { form.reset(); form.hidden = false; done.hidden = true; form.querySelector('#topic').focus(); });
}
