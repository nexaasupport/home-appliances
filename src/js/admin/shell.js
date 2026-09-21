import { db } from '../store.js';
import { can, logout } from './auth.js';
import { $, $$, avatar, esc, go, icon, inr, timeAgo } from './ui.js';

export const NAV = [
  { group: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: 'grid' }] },
  { group: 'Sales', items: [
    { id: 'enquiries', label: 'Enquiries', icon: 'headset', badge: () => db.all('enquiries').filter((e) => e.status === 'new').length },
    { id: 'orders', label: 'Orders', icon: 'receipt', badge: () => db.all('orders').filter((o) => o.status === 'quote').length, tone: 'muted' },
    { id: 'customers', label: 'Customers', icon: 'users' },
  ] },
  { group: 'Catalogue', items: [
    { id: 'products', label: 'Products', icon: 'box' },
    { id: 'inventory', label: 'Inventory', icon: 'truck', badge: () => db.allProducts().filter((p) => db.status(p) !== 'in').length, tone: 'warn' },
  ] },
  { group: 'Operations', items: [{ id: 'service', label: 'Service requests', icon: 'tool', badge: () => db.all('services').filter((s) => s.status !== 'done').length, tone: 'muted' }] },
  { group: 'Insights', items: [{ id: 'reports', label: 'Reports', icon: 'chart' }] },
  { group: 'System', items: [{ id: 'activity', label: 'Activity log', icon: 'clock' }, { id: 'settings', label: 'Settings', icon: 'wrench' }] },
];

const CREATE = [
  { label: 'New order', icon: 'receipt', to: 'orders?new=1' },
  { label: 'Log enquiry', icon: 'headset', to: 'enquiries?new=1' },
  { label: 'Add product', icon: 'box', to: 'products?new=1' },
  { label: 'Service request', icon: 'tool', to: 'service?new=1' },
];

export function mountShell(root, user) {
  const allowed = (id) => can(user, id);
  root.innerHTML = `
  <div class="ad" id="ad">
    <aside class="ad__side" id="ad-side" aria-label="Admin navigation">
      <a class="ad__brand" href="#/dashboard"><span class="ad__mark">${icon('home', { size: 24 })}</span><span class="ad__brand-text"><strong>Nexaa</strong><small>Admin</small></span></a>
      <nav class="ad__nav">
        ${NAV.map((g) => {
          const items = g.items.filter((i) => allowed(i.id));
          return items.length ? `<div class="ad__group"><span class="ad__group-label">${g.group}</span>${items.map((i) => `<a class="ad__link" href="#/${i.id}" data-nav="${i.id}">${icon(i.icon, { size: 20 })}<span class="ad__link-label">${i.label}</span>${i.badge ? `<span class="ad__badge ad__badge--${i.tone ?? 'hot'}" data-badge="${i.id}" hidden></span>` : ''}</a>`).join('')}</div>` : '';
        }).join('')}
      </nav>
      <div class="ad__side-foot">
        <a class="ad__link" href="/index.html" target="_blank" rel="noopener">${icon('eye', { size: 20 })}<span class="ad__link-label">View website</span></a>
        <button class="ad__link" type="button" id="collapse">${icon('chevron', { size: 20, cls: 'ad__collapse-ico' })}<span class="ad__link-label">Collapse</span></button>
      </div>
    </aside>
    <div class="ad__scrim" data-close-side></div>
    <div class="ad__main">
      <header class="ad__top">
        <button class="icon-btn ad__menu" type="button" id="open-side" aria-label="Open menu" aria-controls="ad-side">${icon('menu', { size: 22 })}</button>
        <button class="ad__search" type="button" id="open-palette">${icon('search', { size: 18 })}<span>Search products, orders, customers…</span><kbd>Ctrl K</kbd></button>
        <div class="ad__top-actions">
          <div class="pop-wrap"><button class="btn btn--primary btn--sm ad__new" type="button" data-pop="new">${icon('plus', { size: 16 })}<span>New</span></button>
            <div class="pop" id="pop-new" hidden>${CREATE.filter((c) => allowed(c.to.split('?')[0])).map((c) => `<a href="#/${c.to}">${icon(c.icon, { size: 18 })}${c.label}</a>`).join('')}</div></div>
          <div class="pop-wrap"><button class="icon-btn ad__bell" type="button" data-pop="bell" aria-label="Notifications">${icon('alert', { size: 20 })}<span class="ad__dot" hidden></span></button>
            <div class="pop pop--wide" id="pop-bell" hidden></div></div>
          <div class="pop-wrap"><button class="ad__user" type="button" data-pop="user" aria-label="Account menu">${avatar(user.name)}<span><strong>${esc(user.name)}</strong><small>${user.role === 'owner' ? 'Owner' : 'Staff'}</small></span>${icon('chevron', { size: 16 })}</button>
            <div class="pop pop--right" id="pop-user" hidden><div class="pop__who">${avatar(user.name)}<div><strong>${esc(user.name)}</strong><small>${esc(user.email)}</small></div></div><a href="/index.html" target="_blank" rel="noopener">${icon('eye', { size: 18 })}View website</a><button type="button" id="signout">${icon('logout', { size: 18 })}Sign out</button></div></div>
        </div>
      </header>
      <main class="ad__view" id="view" tabindex="-1"></main>
    </div>
  </div>`;

  const shell = $('#ad');
  if (localStorage.getItem('ha.collapsed') === '1') shell.classList.add('is-collapsed');

  // ---- sidebar: collapse (desktop) and slide-in (mobile) ----
  $('#collapse').addEventListener('click', () => { const c = shell.classList.toggle('is-collapsed'); localStorage.setItem('ha.collapsed', c ? '1' : '0'); });
  const setSide = (open) => { shell.classList.toggle('is-side-open', open); document.body.classList.toggle('no-scroll', open); $('#open-side').setAttribute('aria-expanded', String(open)); };
  $('#open-side').addEventListener('click', () => setSide(true));
  $('[data-close-side]').addEventListener('click', () => setSide(false));
  $('#ad-side').addEventListener('click', (e) => e.target.closest('a[href^="#/"]') && setSide(false));

  // ---- popovers ----
  const pops = $$('[data-pop]');
  const closePops = () => pops.forEach((b) => { $(`#pop-${b.dataset.pop}`).hidden = true; b.setAttribute('aria-expanded', 'false'); });
  pops.forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); const el = $(`#pop-${b.dataset.pop}`); const open = el.hidden; closePops(); el.hidden = !open; b.setAttribute('aria-expanded', String(open)); }));
  document.addEventListener('click', (e) => { if (!e.target.closest('.pop-wrap')) closePops(); else if (e.target.closest('.pop a, .pop button:not([data-pop])')) closePops(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePops(); setSide(false); } });
  $('#signout').addEventListener('click', logout);

  // ---- live badges and notifications ----
  const refresh = () => {
    NAV.flatMap((g) => g.items).filter((i) => i.badge).forEach((i) => {
      const el = $(`[data-badge="${i.id}"]`); if (!el) return;
      const n = i.badge();
      el.textContent = n > 99 ? '99+' : n; el.hidden = !n;
    });
    const fresh = db.all('enquiries').filter((e) => e.status === 'new');
    $('.ad__dot').hidden = !fresh.length;
    $('#pop-bell').innerHTML = `<div class="pop__title">Notifications <span>${fresh.length} new</span></div>` + (fresh.length
      ? fresh.slice(0, 5).map((e) => `<a class="pop__item" href="#/enquiries?open=${e.id}"><span class="pop__ico">${icon('headset', { size: 18 })}</span><span><strong>${esc(e.name)}</strong><small>${esc(e.topic)}${e.productId ? ` · ${esc(db.get('products', e.productId)?.name ?? '')}` : ''}</small><em>${timeAgo(e.createdAt)}</em></span></a>`).join('')
      : '<p class="pop__empty">You are all caught up.</p>') + `<a class="pop__more" href="#/enquiries">Open enquiries</a>`;
  };
  refresh();
  const unsub = db.subscribe(refresh);

  // ---- command palette (Ctrl/Cmd + K) ----
  const pages = NAV.flatMap((g) => g.items).filter((i) => allowed(i.id));
  function palette() {
    if ($('.ov--palette')) return;
    const wrap = document.createElement('div');
    wrap.className = 'ov ov--palette';
    wrap.innerHTML = `<div class="ov__scrim" data-close></div><section class="pal" role="dialog" aria-modal="true" aria-label="Search"><label class="pal__input">${icon('search', { size: 20 })}<input id="pal-q" type="search" placeholder="Search pages, products, orders, customers…" autocomplete="off"></label><div class="pal__list" id="pal-list" role="listbox"></div><footer class="pal__foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></footer></section>`;
    document.body.append(wrap);
    requestAnimationFrame(() => wrap.classList.add('is-in'));
    const input = $('#pal-q', wrap), list = $('#pal-list', wrap);
    let items = [], idx = 0;
    const close = () => { wrap.classList.add('is-out'); document.removeEventListener('keydown', onKey); setTimeout(() => wrap.remove(), 200); };
    const build = (q) => {
      const s = q.trim().toLowerCase();
      const hit = (t) => !s || t.toLowerCase().includes(s);
      const out = [];
      pages.filter((p) => hit(p.label)).forEach((p) => out.push({ g: 'Pages', icon: p.icon, t: p.label, s: '', to: p.id }));
      if (s) {
        db.allProducts().filter((p) => hit(`${p.name} ${p.brand} ${p.sku}`)).slice(0, 4).forEach((p) => out.push({ g: 'Products', icon: 'box', t: p.name, s: `${inr(p.price)} · ${p.stock} in stock`, to: `products?open=${p.id}` }));
        db.all('customers').filter((c) => hit(`${c.name} ${c.phone}`)).slice(0, 3).forEach((c) => out.push({ g: 'Customers', icon: 'users', t: c.name, s: c.phone, to: `customers?open=${c.id}` }));
        db.all('orders').filter((o) => hit(`${o.invoiceNo} ${db.get('customers', o.customerId)?.name ?? ''}`)).slice(0, 3).forEach((o) => out.push({ g: 'Orders', icon: 'receipt', t: o.invoiceNo, s: `${db.get('customers', o.customerId)?.name ?? ''} · ${inr(o.total)}`, to: `orders/${o.id}` }));
        db.all('enquiries').filter((e) => hit(`${e.name} ${e.message}`)).slice(0, 3).forEach((e) => out.push({ g: 'Enquiries', icon: 'headset', t: e.name, s: e.topic, to: `enquiries?open=${e.id}` }));
      }
      items = out; idx = 0;
      let last = '';
      list.innerHTML = out.length ? out.map((r, i) => { const head = r.g !== last ? `<div class="pal__group">${r.g}</div>` : ''; last = r.g; return `${head}<button type="button" class="pal__item${i === 0 ? ' is-on' : ''}" role="option" data-i="${i}">${icon(r.icon, { size: 18 })}<span><strong>${esc(r.t)}</strong>${r.s ? `<small>${esc(r.s)}</small>` : ''}</span></button>`; }).join('') : '<p class="pop__empty">No results.</p>';
    };
    const mark = () => $$('.pal__item', list).forEach((b, i) => { b.classList.toggle('is-on', i === idx); if (i === idx) b.scrollIntoView({ block: 'nearest' }); });
    const open = (i) => { const r = items[i]; if (r) { close(); go(r.to); } };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(items.length - 1, idx + 1); mark(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(0, idx - 1); mark(); }
      if (e.key === 'Enter') { e.preventDefault(); open(idx); }
    };
    document.addEventListener('keydown', onKey);
    input.addEventListener('input', () => build(input.value));
    list.addEventListener('click', (e) => { const b = e.target.closest('.pal__item'); if (b) open(Number(b.dataset.i)); });
    wrap.addEventListener('click', (e) => e.target.closest('[data-close]') && close());
    build(''); input.focus();
  }
  $('#open-palette').addEventListener('click', palette);
  addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette(); } });

  return {
    view: $('#view'),
    setActive(id) { $$('[data-nav]').forEach((a) => { const on = a.dataset.nav === id; a.classList.toggle('is-active', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); }); },
    destroy: unsub,
  };
}
