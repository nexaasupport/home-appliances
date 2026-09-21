import '@fontsource-variable/inter';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '../scss/main.scss';
import { mountLayout } from './components/layout.js';
import { initCountUp, initParallax, initReveal } from './utils/motion.js';

const pages = {
  home: () => import('./pages/home.js').then((m) => m.renderHome),
  products: () => import('./pages/products.js').then((m) => m.renderProducts),
  product: () => import('./pages/product.js').then((m) => m.renderProduct),
  offers: () => import('./pages/simple.js').then((m) => m.renderOffers),
  brands: () => import('./pages/simple.js').then((m) => m.renderBrands),
  services: () => import('./pages/simple.js').then((m) => m.renderServices),
  contact: () => import('./pages/contact.js').then((m) => m.renderContact),
};

async function boot() {
  mountLayout();
  const render = await pages[document.body.dataset.page]?.();
  render?.();
  initReveal();
  initCountUp();
  initParallax();
  document.documentElement.classList.add('is-ready');
}

boot();
