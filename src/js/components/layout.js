import { site } from '../../data/catalog.js';
import { icon } from '../utils/icons.js';
import { tel, waLink } from '../utils/format.js';

const here = () => location.pathname.split('/').pop() || 'index.html';
const href = (h) => `/${h}`;

const logo = (light = false) => `
  <a class="logo ${light ? 'logo--light' : ''}" href="/index.html" aria-label="${site.name} home">
    <span class="logo__mark">${icon('home', { size: 30 })}</span>
    <span class="logo__text"><strong>${site.name}</strong><small>${site.tagline}</small></span>
  </a>`;

export function mountHeader() {
  const cur = here();
  const links = site.nav
    .map(([label, h]) => {
      const active = h.split('#')[0] === cur && !h.includes('#');
      return `<li><a class="nav__link${active ? ' is-active' : ''}" href="${href(h)}" ${active ? 'aria-current="page"' : ''}>${label}${label === 'Products' ? icon('chevron', { size: 12, cls: 'nav__caret' }) : ''}</a></li>`;
    })
    .join('');

  document.querySelector('#site-header').outerHTML = `
  <header class="header" id="site-header">
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="container header__inner">
      ${logo()}
      <nav class="nav" id="primary-nav" aria-label="Primary"><ul>${links}</ul></nav>
      <div class="header__actions">
        <a class="icon-btn" href="/products.html" aria-label="Search products">${icon('search', { size: 20 })}</a>
        <a class="btn btn--primary btn--sm header__call" href="${tel()}">${icon('phone', { size: 16 })}<span>${site.phone}</span></a>
        <button class="icon-btn header__toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">${icon('menu', { size: 22 })}</button>
      </div>
    </div>
  </header>`;

  const header = document.querySelector('#site-header');
  const toggle = header.querySelector('.header__toggle');
  const setOpen = (open) => {
    header.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.innerHTML = icon(open ? 'close' : 'menu', { size: 22 });
  };
  toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
  header.querySelectorAll('.nav__link').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('is-scrolled', scrollY > 12);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

export function mountFooter() {
  const links = site.nav.map(([l, h]) => `<a href="${href(h)}">${l}</a>`).join('');
  document.querySelector('#site-footer').outerHTML = `
  <footer class="footer">
    <div class="container footer__inner">
      ${logo(true)}
      <nav class="footer__nav" aria-label="Footer">${links}</nav>
      <div class="footer__social">
        <a class="icon-btn icon-btn--dark" href="#" aria-label="Facebook">${icon('facebook')}</a>
        <a class="icon-btn icon-btn--dark" href="#" aria-label="Instagram">${icon('instagram')}</a>
        <a class="icon-btn icon-btn--dark" href="#" aria-label="YouTube">${icon('youtube')}</a>
      </div>
      <button class="to-top" type="button">Back to top ${icon('up', { size: 16 })}</button>
    </div>
    <div class="container footer__legal">
      <span>© ${new Date().getFullYear()} ${site.name}. All rights reserved.</span>
      <a href="/admin/login.html">Staff login</a>
    </div>
  </footer>
  <a class="fab" href="${waLink('Hi! I would like to know more about your appliances.')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${icon('whatsapp', { size: 28 })}</a>
  <div class="mobile-bar" role="group" aria-label="Quick contact">
    <a class="btn btn--primary" href="${tel()}">${icon('phone', { size: 18 })} Call</a>
    <a class="btn btn--whatsapp" href="${waLink('Hi! I would like to know more about your appliances.')}" target="_blank" rel="noopener">${icon('whatsapp', { size: 18 })} WhatsApp</a>
  </div>`;
  document.querySelector('.to-top').addEventListener('click', () =>
    scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
}

export function mountLayout() {
  mountHeader();
  mountFooter();
}
