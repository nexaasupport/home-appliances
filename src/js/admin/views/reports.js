import { categories } from '../../../data/catalog.js';
import { db } from '../../store.js';
import { $, barChart, donut, downloadCSV, esc, icon, inr, pageHead } from '../ui.js';

const DAY = 864e5;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BOOKED = new Set(['confirmed', 'delivered', 'completed']);
const RANGES = [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['365', 'Last 12 months'], ['all', 'All time']];
const COLORS = ['#0b2a55', '#1faa59', '#e9a23b', '#7c5cd6', '#2f80ed', '#e5484d', '#0f9ea6', '#8a94ab', '#c2410c'];

export default function render({ el, onCleanup, can }) {
  let range = sessionStorage.getItem('rep.range') || '30';

  const paint = () => {
    const now = Date.now();
    const from = range === 'all' ? 0 : now - Number(range) * DAY;
    const orders = db.all('orders').filter((o) => BOOKED.has(o.status) && new Date(o.createdAt).getTime() >= from);
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const collected = orders.reduce((s, o) => s + db.orderPaid(o), 0);
    const profit = orders.reduce((s, o) => s + o.items.reduce((t, i) => t + i.qty * (i.price - db.unitCost(i.productId)), 0) - (o.discount || 0), 0);
    const enq = db.all('enquiries').filter((e) => new Date(e.createdAt).getTime() >= from);
    const won = enq.filter((e) => e.status === 'won').length;

    // buckets: daily up to 31 days, otherwise weekly (or monthly for all time)
    const span = range === 'all' ? 365 : Number(range);
    const step = span <= 31 ? DAY : span <= 120 ? 7 * DAY : 30 * DAY;
    const n = Math.min(24, Math.ceil(span / (step / DAY)));
    const buckets = Array.from({ length: n }, (_, i) => { const start = now - (n - i) * step; const d = new Date(start + step); return { start, value: 0, label: step >= 30 * DAY ? MON[d.getMonth()] : `${d.getDate()} ${MON[d.getMonth()]}` }; });
    orders.forEach((o) => { const t = new Date(o.createdAt).getTime(); const b = buckets.find((x) => t >= x.start && t < x.start + step); if (b) b.value += o.total; });

    const byCat = new Map(), byProd = new Map();
    orders.forEach((o) => o.items.forEach((i) => {
      const p = db.get('products', i.productId); const amt = i.qty * i.price;
      byCat.set(p?.category ?? 'other', (byCat.get(p?.category ?? 'other') ?? 0) + amt);
      const r = byProd.get(i.name) ?? { name: i.name, qty: 0, revenue: 0 }; r.qty += i.qty; r.revenue += amt; byProd.set(i.name, r);
    }));
    const cats = [...byCat].sort((a, b) => b[1] - a[1]).map(([id, value], i) => ({ label: categories.find((c) => c.id === id)?.name ?? 'Other', value, color: COLORS[i % COLORS.length] }));
    const top = [...byProd.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
    const kpi = (l, v, sub = '') => `<article class="kpi"><span class="kpi__label">${l}</span><strong class="kpi__value">${v}</strong>${sub ? `<small class="kpi__note">${sub}</small>` : ''}</article>`;

    el.innerHTML = `${pageHead({ title: 'Reports', sub: 'Confirmed, delivered and completed orders only.', actions: `<label class="dt__filter"><span class="sr">Period</span><select class="input" id="range">${RANGES.map(([v, l]) => `<option value="${v}" ${v === range ? 'selected' : ''}>${l}</option>`).join('')}</select></label><button class="btn btn--ghost btn--sm" id="prt" type="button">${icon('receipt', { size: 16 })} Print</button>` })}
      <section class="kpis">${kpi('Revenue', inr(revenue), `${orders.length} orders`)}${kpi('Collected', inr(collected), `${inr(Math.max(0, revenue - collected))} still due`)}${can('profit') ? kpi('Gross profit', inr(profit), revenue ? `${Math.round((profit / revenue) * 100)}% margin` : '') : kpi('Average order', inr(orders.length ? Math.round(revenue / orders.length) : 0))}${kpi('Enquiry conversion', `${enq.length ? Math.round((won / enq.length) * 100) : 0}%`, `${won} won of ${enq.length}`)}</section>
      <div class="grid2">
        <section class="card card--pad"><div class="card__head"><h2>Revenue</h2></div>${revenue ? barChart(buckets, { label: 'Revenue over time' }) : '<p class="muted">No revenue in this period.</p>'}</section>
        <section class="card card--pad"><div class="card__head"><h2>Sales by category</h2></div>${cats.length ? `<div class="donut-wrap">${donut(cats)}<ul class="legend">${cats.map((c) => `<li><i style="background:${c.color}"></i>${esc(c.label)}<b>${inr(c.value)}</b></li>`).join('')}</ul></div>` : '<p class="muted">No sales yet.</p>'}</section>
        <section class="card card--flush"><div class="card__head card__head--pad"><h2>Top products</h2></div>${top.length ? `<ul class="rows">${top.map((t, i) => `<li><span class="rank">${i + 1}</span><span class="rows__grow"><strong>${esc(t.name)}</strong><small>${t.qty} sold</small></span><b>${inr(t.revenue)}</b></li>`).join('')}</ul>` : '<p class="muted card--pad">Nothing sold yet.</p>'}</section>
        <section class="card card--pad"><div class="card__head"><h2>Export data</h2></div><p class="muted">Download spreadsheets that open in Excel or Google Sheets.</p>
          <div class="row-actions"><button class="btn btn--ghost btn--sm" data-x="orders">Orders</button><button class="btn btn--ghost btn--sm" data-x="products">Products</button><button class="btn btn--ghost btn--sm" data-x="customers">Customers</button><button class="btn btn--ghost btn--sm" data-x="enquiries">Enquiries</button></div></section>
      </div>`;
  };

  el.addEventListener('change', (e) => { if (e.target.id === 'range') { range = e.target.value; sessionStorage.setItem('rep.range', range); paint(); } });
  el.addEventListener('click', (e) => {
    if (e.target.closest('#prt')) print();
    const x = e.target.closest('[data-x]'); if (!x) return;
    const c = (id) => db.get('customers', id);
    const map = {
      orders: ['orders', ['Invoice', 'Date', 'Customer', 'Status', 'Total', 'Paid'], db.all('orders').map((o) => [o.invoiceNo, o.createdAt.slice(0, 10), c(o.customerId)?.name, o.status, o.total, db.orderPaid(o)])],
      products: ['products', ['SKU', 'Name', 'Brand', 'Price', 'Cost', 'Stock'], db.allProducts().map((p) => [p.sku, p.name, p.brand, p.price, p.cost, p.stock])],
      customers: ['customers', ['Name', 'Phone', 'Email', 'Address'], db.all('customers').map((k) => [k.name, k.phone, k.email, k.address])],
      enquiries: ['enquiries', ['Date', 'Name', 'Phone', 'Topic', 'Status'], db.all('enquiries').map((k) => [k.createdAt.slice(0, 10), k.name, k.phone, k.topic, k.status])],
    }[x.dataset.x];
    downloadCSV(map[0], [map[1], ...map[2]]);
  });
  paint();
  onCleanup(db.subscribe(paint));
  void $;
}
