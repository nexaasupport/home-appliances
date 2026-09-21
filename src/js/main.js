import '@fontsource-variable/inter';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '../scss/main.scss';
import { site } from '../data/catalog.js';
import { db } from './store.js';
import { mountLayout } from './components/layout.js';
import { initCountUp, initImages, initParallax, initReveal } from './utils/motion.js';

const pages = {
  home: () => import('./pages/home.js').then((m) => m.renderHome),
  about: () => import('./pages/about.js').then((m) => m.renderAbout),
  products: () => import('./pages/products.js').then((m) => m.renderProducts),
  product: () => import('./pages/product.js').then((m) => m.renderProduct),
  offers: () => import('./pages/simple.js').then((m) => m.renderOffers),
  brands: () => import('./pages/simple.js').then((m) => m.renderBrands),
  services: () => import('./pages/simple.js').then((m) => m.renderServices),
  contact: () => import('./pages/contact.js').then((m) => m.renderContact),
};

// Delegated: log an enquiry in the admin whenever a visitor taps an Enquire link.
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-enq]');
  if (a) db.addEnquiry({ source: 'website', productId: a.dataset.enq });
});

async function boot() {
  const s = db.settings();
  Object.assign(site, { name: s.name, tagline: s.tagline, phone: s.phone, whatsapp: s.whatsapp, email: s.email, address: s.address, hours: s.hours });
  initImages();
  mountLayout();
  const render = await pages[document.body.dataset.page]?.();
  render?.();
  initReveal();
  initCountUp();
  initParallax();
  document.documentElement.classList.add('is-ready');
}

boot();
