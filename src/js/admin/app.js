import '@fontsource-variable/inter';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '../../scss/main.scss';
import { currentUser, can } from './auth.js';
import { mountShell } from './shell.js';
import { icon, toast } from './ui.js';

const user = currentUser();

const ROUTES = {
  dashboard: () => import('./views/dashboard.js'),
  enquiries: () => import('./views/enquiries.js'),
  orders: () => import('./views/orders.js'),
  customers: () => import('./views/customers.js'),
  products: () => import('./views/products.js'),
  inventory: () => import('./views/inventory.js'),
  service: () => import('./views/service.js'),
  reports: () => import('./views/reports.js'),
  activity: () => import('./views/activity.js'),
  settings: () => import('./views/settings.js'),
};

function parse() {
  const [path, qs = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [name = 'dashboard', id = ''] = path.split('/');
  return { name: name || 'dashboard', id, query: Object.fromEntries(new URLSearchParams(qs)) };
}

function boot() {
  const shell = mountShell(document.querySelector('#app'), user);
  let cleanups = [];
  let seq = 0;

  const render = async () => {
    const my = ++seq;
    const { name, id, query } = parse();
    const view = shell.view;
    cleanups.forEach((fn) => fn());
    cleanups = [];
    shell.setActive(ROUTES[name] ? name : 'dashboard');

    if (!ROUTES[name]) { location.hash = '#/dashboard'; return; }
    if (!can(user, name)) {
      view.innerHTML = `<div class="empty-state empty-state--page"><span class="empty-state__icon">${icon('lock', { size: 28 })}</span><h3>This area is for the store owner</h3><p>Your account (${user.role}) does not have access to ${name}. Ask the owner if you need it.</p><a class="btn btn--primary" href="#/dashboard">Back to dashboard</a></div>`;
      return;
    }
    view.classList.add('is-leaving');
    view.innerHTML = '<div class="skeleton-page"><div class="skeleton" style="height:56px;width:40%"></div><div class="skeleton" style="height:120px"></div><div class="skeleton" style="height:320px"></div></div>';
    try {
      const mod = await ROUTES[name]();
      if (my !== seq) return; // a newer navigation won
      view.classList.remove('is-leaving');
      view.innerHTML = '';
      await mod.default({ el: view, id, query, user, onCleanup: (fn) => cleanups.push(fn), can: (p) => can(user, p) });
      view.classList.remove('is-entering'); void view.offsetWidth; view.classList.add('is-entering');
      if (!query.keepScroll) scrollTo({ top: 0 });
    } catch (err) {
      console.error(err);
      view.classList.remove('is-leaving');
      view.innerHTML = `<div class="empty-state empty-state--page"><span class="empty-state__icon">${icon('alert', { size: 28 })}</span><h3>Something went wrong</h3><p>${String(err.message ?? err)}</p><button class="btn btn--primary" type="button" onclick="location.reload()">Reload</button></div>`;
    }
  };

  addEventListener('hashchange', render);
  addEventListener('ha:quota', () => toast('Browser storage is full. Recent changes may not be saved. Export a backup in Settings.', { tone: 'error', ms: 9000 }));
  render();
}

if (!user) location.replace(`/admin/login.html?next=${encodeURIComponent(location.hash)}`);
else boot();
