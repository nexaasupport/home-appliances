import { aboutMenu, categories, nav, services, site } from '../../data/catalog.js';
import { db } from '../store.js';
import { icon } from '../utils/icons.js';
import { photo, tel, waLink } from '../utils/format.js';

const here = () => location.pathname.split('/').pop() || 'index.html';
const href = (h) => `/${h}`;

const logo = (light = false) => `
  <a class="logo ${light ? 'logo--light' : ''}" href="/index.html" aria-label="${site.name} home">
    <span class="logo__mark">${icon('home', { size: 30 })}</span>
    <span class="logo__text"><strong>${site.name}</strong><small>${site.tagline}</small></span>
  </a>`;

// ---------- dropdown panels ----------
const menus = {
  products: () => {
    const counts = db.products().reduce((m, p) => ((m[p.category] = (m[p.category] ?? 0) + 1), m), {});
    return `
    <a class="menu__all" href="/products.html">All products ${icon('arrow', { size: 16 })}</a>
    <div class="menu__cats">
      ${categories.map((c) => `<a class="menu__link" href="/products.html?category=${c.id}"><img class="menu__thumb" src="${photo(c.photo, 200, 150)}" alt="" width="200" height="150" loading="lazy"><span class="menu__icon">${icon(c.icon, { size: 20 })}</span><span><strong>${c.name}</strong><small>${counts[c.id] ?? 0} products</small></span></a>`).join('')}
    </div>
    <a class="menu__feature" href="/products.html">
      <img src="${photo('living2', 520, 360)}" alt="" width="520" height="360" loading="lazy">
      <span class="menu__feature-copy"><strong>Browse the full store</strong><small>Filter by brand, price and availability</small><span class="menu__cta">Shop all products ${icon('arrow', { size: 16 })}</span></span>
    </a>`;
  },
  services: () => `
    <a class="menu__all" href="/services.html">All services ${icon('arrow', { size: 16 })}</a>
    <div class="menu__list">
      ${services.map((s) => `<a class="menu__link" href="/services.html#${s.id}"><span class="menu__icon">${icon(s.icon, { size: 20 })}</span><span><strong>${s.title}</strong><small>${s.text}</small></span></a>`).join('')}
    </div>`,
  about: () => `
    <a class="menu__all" href="/about.html">About Nexaa ${icon('arrow', { size: 16 })}</a>
    <div class="menu__list menu__list--single">
      ${aboutMenu.map((m) => `<a class="menu__link" href="/${m.href}"><span class="menu__icon">${icon(m.icon, { size: 20 })}</span><span><strong>${m.title}</strong><small>${m.text}</small></span></a>`).join('')}
    </div>`,
};

const navItem = (item, cur) => {
  const active = item.href === cur;
  const link = `<a class="nav__link${active ? ' is-active' : ''}" href="${href(item.href)}" ${active ? 'aria-current="page"' : ''}><span class="nav__ico">${icon(item.icon, { size: 20 })}</span><span class="nav__label">${item.label}</span></a>`;
  if (!item.menu) return `<li class="nav__item">${link}</li>`;
  const id = `menu-${item.menu}`;
  return `
  <li class="nav__item has-menu">
    <div class="nav__row">${link}<button class="nav__caret" type="button" aria-expanded="false" aria-controls="${id}" aria-label="${item.label} submenu">${icon('chevron', { size: 16 })}</button></div>
    <div class="menu menu--${item.menu}" id="${id}"><div class="menu__inner">${menus[item.menu]()}</div></div>
  </li>`;
};

export function mountHeader() {
  const cur = here();
  document.querySelector('#site-header').outerHTML = `
  <header class="header" id="site-header">
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="container header__inner">
      ${logo()}
      <div class="nav__scrim" data-close-nav></div>
      <nav class="nav" id="primary-nav" aria-label="Primary">
        <div class="nav__top">${logo()}<button class="icon-btn nav__close" type="button" aria-label="Close menu" data-close-nav>${icon('close', { size: 22 })}</button></div>
        <div class="nav__scroll">
          <form class="nav__search" action="/products.html" role="search">
            <label class="sr" for="nav-q">Search products</label>${icon('search', { size: 18 })}
            <input id="nav-q" name="q" type="search" placeholder="Search appliances…" autocomplete="off">
          </form>
          <div class="nav__quick">
            <a href="${tel()}">${icon('phone', { size: 20 })}<span>Call</span></a>
            <a href="${waLink('Hi! I would like to know more about your appliances.')}" target="_blank" rel="noopener" class="nav__quick-wa">${icon('whatsapp', { size: 20 })}<span>WhatsApp</span></a>
            <a href="https://maps.google.com/?q=Anna+Salai+Coimbatore" target="_blank" rel="noopener">${icon('pin', { size: 20 })}<span>Directions</span></a>
          </div>
          <ul class="nav__list">${nav.map((i) => navItem(i, cur)).join('')}</ul>
        </div>
        <div class="nav__foot">
          <p>${icon('pin', { size: 14 })}<span>Anna Salai, Coimbatore</span></p>
          <p>${icon('clock', { size: 14 })}<span>Open daily, 9 AM - 9 PM</span></p>
        </div>
      </nav>
      <div class="header__actions">
        <a class="icon-btn" href="/products.html" aria-label="Search products">${icon('search', { size: 20 })}</a>
        <a class="btn btn--primary btn--sm header__call" href="${tel()}">${icon('phone', { size: 16 })}<span>${site.phone}</span></a>
        <button class="icon-btn header__toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">${icon('menu', { size: 22 })}</button>
      </div>
    </div>
  </header>`;

  const header = document.querySelector('#site-header');
  const toggle = header.querySelector('.header__toggle');
  const items = [...header.querySelectorAll('.has-menu')];

  const closeMenus = (except) => items.forEach((li) => {
    if (li === except) return;
    li.classList.remove('is-open');
    li.querySelector('.nav__caret').setAttribute('aria-expanded', 'false');
  });
  const setOpen = (open) => {
    header.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.innerHTML = icon(open ? 'close' : 'menu', { size: 22 });
    if (open) header.querySelector('.nav__close').focus();
    else { closeMenus(); if (matchMedia('(max-width: 1023px)').matches) toggle.focus(); }
  };

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
  header.querySelectorAll('[data-close-nav]').forEach((el) => el.addEventListener('click', () => setOpen(false)));
  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => e.matches && setOpen(false));
  const isMobile = () => matchMedia('(max-width: 1023px)').matches;
  items.forEach((li) => {
    const caret = li.querySelector('.nav__caret');
    li.querySelector('.nav__link').addEventListener('click', (e) => {
      if (!isMobile()) return;
      e.preventDefault();
      e.stopPropagation();
      caret.click();
    });
    caret.addEventListener('click', () => {
      const open = !li.classList.contains('is-open');
      closeMenus(li);
      li.classList.toggle('is-open', open);
      caret.setAttribute('aria-expanded', String(open));
    });
  });
  // navigating (any link in the nav or a menu) closes the drawer
  header.querySelectorAll('.nav a:not(.has-menu > .nav__row .nav__link)').forEach((a) => a.addEventListener('click', () => { setOpen(false); closeMenus(); }));
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-menu')) closeMenus(); });
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openLi = items.find((li) => li.classList.contains('is-open'));
    closeMenus();
    openLi?.querySelector('.nav__caret').focus();
    setOpen(false);
  });

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
  const wa = waLink('Hi! I would like to know more about your appliances.');
  document.querySelector('#site-footer').outerHTML = `
  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        ${logo(true)}
        <p>Genuine home appliances from trusted brands, with honest advice, delivery, installation and after-sales care.</p>
        <a class="btn btn--whatsapp" href="${wa}" target="_blank" rel="noopener">${icon('whatsapp', { size: 18 })} Chat on WhatsApp</a>
      </div>
      <nav class="footer__col" aria-label="Shop">
        <h3>Shop</h3>
        ${categories.slice(0, 6).map((c) => `<a href="/products.html?category=${c.id}">${c.name}</a>`).join('')}
        <a href="/products.html">All products</a>
      </nav>
      <nav class="footer__col" aria-label="Company">
        <h3>Company</h3>
        <a href="/about.html">About us</a><a href="/brands.html">Brands</a><a href="/offers.html">Offers</a><a href="/services.html">Services</a><a href="/about.html#faq">FAQs</a><a href="/contact.html">Contact</a>
      </nav>
      <div class="footer__col">
        <h3>Visit us</h3>
        <p>${icon('pin', { size: 16 })}<span>${site.address}</span></p>
        <p>${icon('phone', { size: 16 })}<a href="${tel()}">${site.phone}</a></p>
        <p>${icon('mail', { size: 16 })}<a href="mailto:${site.email}">${site.email}</a></p>
        <p>${icon('clock', { size: 16 })}<span>${site.hours}</span></p>
      </div>
    </div>
    <div class="container footer__legal">
      <span>© ${new Date().getFullYear()} ${site.name}. All rights reserved.</span>
      <span class="footer__links"><button class="to-top" type="button">Back to top ${icon('up', { size: 16 })}</button><a href="/admin/login.html">Staff login</a></span>
    </div>
  </footer>
  <a class="fab" href="${wa}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${icon('whatsapp', { size: 28 })}</a>
  <div class="mobile-bar" role="group" aria-label="Quick contact">
    <a class="btn btn--primary" href="${tel()}">${icon('phone', { size: 18 })} Call</a>
    <a class="btn btn--whatsapp" href="${wa}" target="_blank" rel="noopener">${icon('whatsapp', { size: 18 })} WhatsApp</a>
  </div>`;
  document.querySelector('.to-top').addEventListener('click', () =>
    scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
}

export function mountLayout() {
  mountHeader();
  mountFooter();
}
