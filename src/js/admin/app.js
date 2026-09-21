import '@fontsource-variable/inter';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '../../scss/main.scss';
import { categories, site } from '../../data/catalog.js';
import { db, LOW_STOCK } from '../store.js';
import { icon } from '../utils/icons.js';
import { inr } from '../utils/format.js';
import { initCountUp, initReveal, toast } from '../utils/motion.js';

// Demo-only gate: this is a front-end prototype, NOT real security. Swap for a server-side session.
const DEMO = { user: 'admin@homeappliances.in', pass: 'admin123' };
const authed = () => sessionStorage.getItem('ha.admin') === '1';
const page = document.body.dataset.admin;
const root = document.querySelector('#app');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const today = () => new Date().toISOString().slice(0, 10);
const pname = (id) => db.product(id)?.name ?? 'Deleted product';
const badge = (s) => `<span class="badge badge--${s}">${{ in: 'In Stock', low: 'Low Stock', out: 'Out of Stock' }[s]}</span>`;

const NAV = [
  ['dashboard', 'Dashboard', 'grid'], ['products', 'Products', 'box'], ['stock', 'Stock / Inventory', 'receipt'], ['reports', 'Reports', 'chart'],
];

function shell(title, body, actions = '') {
  root.innerHTML = `
  <div class="admin">
    <aside class="admin__side" id="side">
      <a class="logo logo--light admin__brand" href="/index.html"><span class="logo__mark">${icon('home', { size: 26 })}</span><span class="logo__text"><strong>Nexaa</strong><small>Admin Panel</small></span></a>
      <nav aria-label="Admin">${NAV.map(([k, l, i]) => `<a class="admin__link${page === k ? ' is-active' : ''}" href="/admin/${k}.html" ${page === k ? 'aria-current="page"' : ''}>${icon(i, { size: 18 })}${l}</a>`).join('')}</nav>
      <button class="admin__link admin__logout" type="button" id="logout">${icon('logout', { size: 18 })}Log out</button>
    </aside>
    <div class="admin__main">
      <header class="admin__top">
        <button class="icon-btn admin__menu" type="button" id="menu" aria-label="Toggle menu" aria-controls="side" aria-expanded="false">${icon('menu', { size: 22 })}</button>
        <h1>${title}</h1><div class="admin__actions">${actions}</div>
        <span class="admin__user" title="Signed in as ${DEMO.user}">A</span>
      </header>
      <main class="admin__body" id="main" tabindex="-1">${body}</main>
    </div>
  </div>`;
  document.querySelector('#logout').onclick = () => { sessionStorage.removeItem('ha.admin'); location.href = '/admin/login.html'; };
  const side = document.querySelector('#side'), menu = document.querySelector('#menu');
  menu.onclick = () => { const o = side.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(o)); };
}

// ---------- Modal ----------
function modal({ title, body, onSubmit, submit = 'Save' }) {
  const wrap = document.createElement('div');
  wrap.className = 'modal';
  wrap.innerHTML = `<div class="modal__scrim" data-close></div>
    <form class="modal__box" role="dialog" aria-modal="true" aria-labelledby="mt" novalidate>
      <header><h2 id="mt">${title}</h2><button class="icon-btn" type="button" data-close aria-label="Close">${icon('close')}</button></header>
      <div class="modal__body">${body}</div>
      <footer><button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit">${submit}</button></footer>
    </form>`;
  const prev = document.activeElement;
  const close = () => { wrap.classList.add('is-out'); setTimeout(() => { wrap.remove(); prev?.focus(); }, 180); document.removeEventListener('keydown', esc_); };
  const esc_ = (e) => e.key === 'Escape' && close();
  wrap.addEventListener('click', (e) => e.target.closest('[data-close]') && close());
  wrap.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const bad = [...f.querySelectorAll('[required]')].find((el) => !el.value.trim());
    if (bad) { bad.setAttribute('aria-invalid', 'true'); bad.focus(); return; }
    if (onSubmit(Object.fromEntries(new FormData(f))) !== false) close();
  });
  document.body.append(wrap);
  document.addEventListener('keydown', esc_);
  wrap.querySelector('input,select,textarea')?.focus();
}
const field = (label, name, attrs = '', value = '') => `<div class="field"><label for="f-${name}">${label}</label><input class="input" id="f-${name}" name="${name}" value="${esc(value)}" ${attrs}></div>`;
const select = (label, name, opts, sel = '') => `<div class="field"><label for="f-${name}">${label}</label><select class="input" id="f-${name}" name="${name}" required>${opts.map(([v, l]) => `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;

// ---------- Screens ----------
function login() {
  if (authed()) return void (location.href = '/admin/dashboard.html');
  root.innerHTML = `
  <div class="login">
    <section class="login__brand"><span class="login__logo">${icon('home', { size: 44 })}</span><h1>Nexaa</h1><p>Admin Panel</p><small>Inventory, purchases, sales and reports for ${esc(site.name)}.</small></section>
    <form class="login__form" id="login" novalidate>
      <h2>Login to your account</h2>
      <div class="field"><label for="u">Email / Username</label><input class="input" id="u" name="u" autocomplete="username" required></div>
      <div class="field"><label for="p">Password</label><div class="pw"><input class="input" id="p" name="p" type="password" autocomplete="current-password" required><button class="icon-btn" type="button" id="show" aria-label="Show password">${icon('eye')}</button></div></div>
      <p class="error" id="err" role="alert"></p>
      <button class="btn btn--primary btn--block btn--lg" type="submit">Login</button>
      <p class="hint">Demo: <code>${DEMO.user}</code> / <code>${DEMO.pass}</code></p>
    </form>
  </div>`;
  const p = document.querySelector('#p');
  document.querySelector('#show').onclick = (e) => { const s = p.type === 'password'; p.type = s ? 'text' : 'password'; e.currentTarget.setAttribute('aria-label', s ? 'Hide password' : 'Show password'); };
  document.querySelector('#login').onsubmit = (e) => {
    e.preventDefault();
    const { u, p: pw } = Object.fromEntries(new FormData(e.target));
    if (u.trim() === DEMO.user && pw === DEMO.pass) { sessionStorage.setItem('ha.admin', '1'); location.href = '/admin/dashboard.html'; }
    else { document.querySelector('#err').textContent = 'Incorrect email or password. Check the demo credentials below.'; p.setAttribute('aria-invalid', 'true'); p.focus(); }
  };
}

function dashboard() {
  const ps = db.products(), sales = db.sales(), purchases = db.purchases();
  const low = ps.filter((p) => db.status(p) !== 'in');
  const rev = sales.reduce((s, x) => s + x.amount, 0), cost = purchases.reduce((s, x) => s + x.cost * x.qty, 0);
  shell('Dashboard', `
  <section class="stats" data-stagger>
    ${[['Total Products', ps.length, '', 'box'], ['Low Stock', low.length, '', 'alert'], ['Total Sales', rev, '₹', 'receipt'], ['Total Purchases', cost, '₹', 'wallet']].map(([l, v, pre, i], k) => `
    <div class="stat${l === 'Low Stock' && v ? ' stat--warn' : ''}" data-reveal><span class="stat__icon">${icon(i, { size: 20 })}</span><div><small>${l}</small><strong data-count="${v}" data-prefix="${pre}">${pre}${v.toLocaleString('en-IN')}</strong></div></div>`).join('')}
  </section>
  <div class="grid2">
    <section class="card" data-reveal><h2>Recent Sales</h2>${table(['Date', 'Product', 'Customer', 'Amount'], sales.slice(0, 6).map((s) => [s.date, esc(pname(s.productId)), esc(s.customer), inr(s.amount)]), 'No sales yet')}</section>
    <section class="card" data-reveal><h2>Low Stock Alerts</h2>${low.length ? `<ul class="alerts">${low.map((p) => `<li>${icon('alert', { size: 18 })}<span><strong>${esc(p.name)}</strong><small>${p.stock} left</small></span>${badge(db.status(p))}</li>`).join('')}</ul>` : '<p class="muted">All products are well stocked.</p>'}</section>
  </div>`, `<a class="btn btn--primary btn--sm" href="/admin/products.html">${icon('plus', { size: 16 })} Add Product</a>`);
}

function table(head, rows, empty) {
  return rows.length
    ? `<div class="table-wrap"><table class="table table--stack"><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td data-label="${head[i] ?? ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    : `<p class="muted">${empty}</p>`;
}

function productForm(p = {}) {
  return `${field('Product name', 'name', 'required', p.name ?? '')}
  <div class="row2">${field('Brand', 'brand', 'required', p.brand ?? '')}${select('Category', 'category', categories.map((c) => [c.id, c.name]), p.category)}</div>
  <div class="row2">${field('Price (₹)', 'price', 'type="number" min="0" inputmode="numeric" required', p.price ?? '')}${field('Stock', 'stock', 'type="number" min="0" inputmode="numeric" required', p.stock ?? '')}</div>`;
}

function products() {
  const paint = () => {
    const q = (document.querySelector('#search')?.value ?? '').toLowerCase();
    const rows = db.products().filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(q));
    document.querySelector('#rows').innerHTML = rows.length ? rows.map((p) => `
      <tr><td data-label="Product"><strong>${esc(p.name)}</strong></td><td data-label="Brand">${esc(p.brand)}</td><td data-label="Category">${esc(categories.find((c) => c.id === p.category)?.name ?? p.category)}</td>
      <td class="num" data-label="Stock">${p.stock}</td><td class="num" data-label="Price">${inr(p.price)}</td><td data-label="Status">${badge(db.status(p))}</td>
      <td class="acts"><button class="icon-btn" data-edit="${p.id}" aria-label="Edit ${esc(p.name)}">${icon('edit', { size: 18 })}</button><button class="icon-btn" data-del="${p.id}" aria-label="Delete ${esc(p.name)}">${icon('trash', { size: 18 })}</button></td></tr>`).join('')
      : `<tr><td colspan="7" class="muted">No products match “${esc(q)}”.</td></tr>`;
  };
  const open = (p) => modal({
    title: p ? 'Edit product' : 'Add product', body: productForm(p),
    onSubmit: (d) => { db.upsertProduct({ ...(p ? { id: p.id } : {}), ...d, price: +d.price, stock: +d.stock }); toast(p ? 'Product updated' : 'Product added'); paint(); },
  });
  shell('Products Management', `
    <div class="toolbar"><div class="field"><label class="sr" for="search">Search products</label><input class="input" id="search" type="search" placeholder="Search products…"></div></div>
    <section class="card card--flush"><div class="table-wrap"><table class="table table--stack"><thead><tr>${['Product', 'Brand', 'Category', 'Stock', 'Price', 'Status', ''].map((h, i) => `<th scope="col" class="${i === 3 || i === 4 ? 'num' : ''}">${h || '<span class="sr">Actions</span>'}</th>`).join('')}</tr></thead><tbody id="rows"></tbody></table></div></section>`,
  `<button class="btn btn--primary btn--sm" id="add" type="button">${icon('plus', { size: 16 })} Add Product</button>`);
  document.querySelector('#add').onclick = () => open();
  document.querySelector('#search').oninput = paint;
  document.querySelector('#rows').addEventListener('click', (e) => {
    const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
    if (ed) open(db.product(ed.dataset.edit));
    if (del) {
      const p = db.product(del.dataset.del);
      modal({ title: 'Delete product?', submit: 'Delete', body: `<p>“${esc(p.name)}” will be removed from the catalogue and the public site. This cannot be undone.</p>`, onSubmit: () => { db.removeProduct(p.id); toast('Product deleted'); paint(); } });
    }
  });
  paint();
}

function stock() {
  const ps = db.products(), sup = db.suppliers();
  const paintLog = () => { document.querySelector('#log').innerHTML = table(['Date', 'Product', 'Supplier', 'Qty', 'Cost'], db.purchases().slice(0, 8).map((x) => [x.date, esc(pname(x.productId)), esc(sup.find((s) => s.id === x.supplierId)?.name ?? '—'), x.qty, inr(x.cost)]), 'No purchases yet'); };
  const paintLow = () => { const l = db.products().filter((p) => db.status(p) !== 'in'); document.querySelector('#low').innerHTML = l.length ? `<ul class="alerts">${l.map((p) => `<li>${icon('alert', { size: 18 })}<span><strong>${esc(p.name)}</strong><small>${p.stock} left</small></span>${badge(db.status(p))}</li>`).join('')}</ul>` : '<p class="muted">Nothing is running low.</p>'; };
  shell('Stock / Inventory', `
  <div class="grid2">
    <form class="card" id="in" novalidate data-reveal><h2>Stock In (record purchase)</h2>
      ${select('Supplier', 'supplierId', sup.map((s) => [s.id, s.name]))}
      ${select('Product', 'productId', ps.map((p) => [p.id, p.name]))}
      <div class="row2">${field('Quantity', 'qty', 'type="number" min="1" inputmode="numeric" required', '1')}${field('Unit cost (₹)', 'cost', 'type="number" min="0" inputmode="numeric" required')}</div>
      ${field('Date', 'date', 'type="date" required', today())}
      <button class="btn btn--primary" type="submit">Add Stock</button></form>
    <form class="card" id="out" novalidate data-reveal><h2>Stock Out (record sale)</h2>
      ${select('Product', 'productId', ps.map((p) => [p.id, `${p.name} (${p.stock} in stock)`]))}
      ${field('Customer', 'customer', 'required')}
      <div class="row2">${field('Quantity', 'qty', 'type="number" min="1" inputmode="numeric" required', '1')}${field('Sale amount (₹)', 'amount', 'type="number" min="0" inputmode="numeric" required')}</div>
      ${field('Date', 'date', 'type="date" required', today())}
      <button class="btn btn--whatsapp" type="submit">Record Sale</button></form>
  </div>
  <div class="grid2"><section class="card" data-reveal><h2>Low Stock Alerts <small class="muted">(≤ ${LOW_STOCK})</small></h2><div id="low"></div></section><section class="card" data-reveal><h2>Recent Purchases</h2><div id="log"></div></section></div>`);
  const submit = (id, fn) => document.querySelector(id).addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [...e.target.querySelectorAll('[required]')].find((el) => !el.value.trim());
    if (bad) { bad.setAttribute('aria-invalid', 'true'); return bad.focus(); }
    if (fn(Object.fromEntries(new FormData(e.target)))) location.reload();
  });
  submit('#in', (d) => { db.addPurchase({ ...d, qty: +d.qty, cost: +d.cost }); toast('Stock added'); return true; });
  submit('#out', (d) => { if (db.addSale({ ...d, qty: +d.qty, amount: +d.amount })) { toast('Sale recorded'); return true; } toast('Not enough stock for that quantity.'); return false; });
  paintLow(); paintLog();
}

function reports() {
  const all = db.sales();
  shell('Reports', `
  <div class="toolbar"><div class="field"><label for="from">From</label><input class="input" id="from" type="date"></div><div class="field"><label for="to">To</label><input class="input" id="to" type="date"></div></div>
  <section class="stats" id="kpi" data-stagger></section>
  <section class="card" data-reveal><h2>Sales Overview</h2><div id="chart"></div></section>`);
  const paint = () => {
    const f = document.querySelector('#from').value, t = document.querySelector('#to').value;
    const s = all.filter((x) => (!f || x.date >= f) && (!t || x.date <= t));
    const p = db.purchases().filter((x) => (!f || x.date >= f) && (!t || x.date <= t));
    const sales = s.reduce((a, x) => a + x.amount, 0), buy = p.reduce((a, x) => a + x.cost * x.qty, 0);
    const cogs = s.reduce((a, x) => a + db.unitCost(x.productId) * x.qty, 0); // cost of goods actually sold
    document.querySelector('#kpi').innerHTML = [['Total Sales', sales], ['Total Purchases', buy], ['Profit (est.)', Math.round(sales - cogs)]].map(([l, v]) => `<div class="stat is-in" data-reveal><div><small>${l}</small><strong>${inr(v)}</strong></div></div>`).join('');
    const by = Object.entries(s.reduce((m, x) => ((m[x.date] = (m[x.date] ?? 0) + x.amount), m), {})).sort();
    const max = Math.max(1, ...by.map(([, v]) => v));
    document.querySelector('#chart').innerHTML = by.length ? `
      <svg class="chart" viewBox="0 0 ${by.length * 64 + 40} 220" role="img" aria-label="Bar chart of daily sales, ${by.length} days, highest ${inr(max)}">
        ${[0.25, 0.5, 0.75, 1].map((g) => `<line x1="30" x2="${by.length * 64 + 40}" y1="${180 - 160 * g}" y2="${180 - 160 * g}" class="grid"/>`).join('')}
        ${by.map(([d, v], i) => { const h = (160 * v) / max; return `<g><rect class="bar" x="${44 + i * 64}" y="${180 - h}" width="40" height="${h}" rx="6" style="--d:${i * 60}ms"><title>${d}: ${inr(v)}</title></rect><text x="${64 + i * 64}" y="200" text-anchor="middle">${d.slice(5)}</text></g>`; }).join('')}
      </svg>
      <details class="chart-data"><summary>View data table</summary>${table(['Date', 'Sales'], by.map(([d, v]) => [d, inr(v)]), '')}</details>` : '<p class="muted">No sales in this date range.</p>';
  };
  document.querySelector('#from').onchange = paint;
  document.querySelector('#to').onchange = paint;
  paint();
}

const screens = { login, dashboard, products, stock, reports };
if (page !== 'login' && !authed()) location.replace('/admin/login.html');
else {
  screens[page]?.();
  initReveal(); initCountUp();
}
