import { db } from '../../store.js';
import { initCountUp, initReveal } from '../../utils/motion.js';
import { $, avatar, barChart, esc, fmtDate, icon, inr, pageHead, pill, sparkline, timeAgo } from '../ui.js';

const DAY = 864e5;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BOOKED = new Set(['confirmed', 'delivered', 'completed']); // orders that count as revenue
const within = (iso, from, to) => { const t = new Date(iso).getTime(); return t >= from && t < to; };

export default function render({ el, user, onCleanup }) {
  const paint = () => {
    const now = Date.now();
    const orders = db.all('orders');
    const booked = orders.filter((o) => BOOKED.has(o.status));
    const rev = (from, to) => booked.filter((o) => within(o.createdAt, from, to)).reduce((s, o) => s + o.total, 0);
    const cnt = (from, to) => booked.filter((o) => within(o.createdAt, from, to)).length;
    const cur = rev(now - 30 * DAY, now + DAY), prev = rev(now - 60 * DAY, now - 30 * DAY);
    const curN = cnt(now - 30 * DAY, now + DAY), prevN = cnt(now - 60 * DAY, now - 30 * DAY);
    const delta = (a, b) => (b ? Math.round(((a - b) / b) * 100) : a ? 100 : 0);

    const days = Array.from({ length: 14 }, (_, i) => {
      const start = new Date(now - (13 - i) * DAY); start.setHours(0, 0, 0, 0);
      return { label: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).replace(' ', ''), value: rev(start.getTime(), start.getTime() + DAY) };
    });
    const enquiries = db.all('enquiries');
    const stages = ['new', 'contacted', 'quoted', 'won', 'lost'].map((s) => ({ s, n: enquiries.filter((e) => e.status === s).length }));
    const fresh = stages[0].n, won = stages[3].n;
    const conv = enquiries.length ? Math.round((won / enquiries.length) * 100) : 0;
    const low = db.allProducts().filter((p) => db.status(p) !== 'in');
    const balance = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Math.max(0, o.total - db.orderPaid(o)), 0);
    const soon = orders.filter((o) => o.status === 'confirmed' && o.delivery?.date && new Date(o.delivery.date).getTime() <= now + 3 * DAY);
    const openService = db.all('services').filter((s) => s.status !== 'done').length;
    const hour = new Date().getHours();
    const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const tasks = [
      { n: fresh, label: 'new enquiries to answer', icon: 'headset', to: 'enquiries', tone: 'blue' },
      { n: orders.filter((o) => o.status === 'quote').length, label: 'quotes awaiting confirmation', icon: 'receipt', to: 'orders', tone: 'violet' },
      { n: soon.length, label: 'deliveries due in 3 days', icon: 'truck', to: 'orders', tone: 'amber' },
      { n: low.length, label: 'products low or out of stock', icon: 'alert', to: 'inventory', tone: 'red' },
      { n: openService, label: 'open service requests', icon: 'tool', to: 'service', tone: 'amber' },
    ].filter((t) => t.n);
    const kpi = (label, value, ic, { pre = '', suf = '', d, series, note, tone = '' } = {}) => `
      <article class="kpi ${tone}" data-reveal>
        <div class="kpi__top"><span class="kpi__icon">${icon(ic, { size: 20 })}</span>${d !== undefined ? `<span class="delta delta--${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d)}%</span>` : ''}</div>
        <strong class="kpi__value" data-count="${value}" data-prefix="${pre}" data-suffix="${suf}">${pre}${value.toLocaleString('en-IN')}${suf}</strong>
        <span class="kpi__label">${label}</span>
        ${series ? `<span class="kpi__spark">${sparkline(series)}</span>` : note ? `<small class="kpi__note">${note}</small>` : ''}
      </article>`;

    el.innerHTML = `
    ${pageHead({ title: `${hello}, ${esc(user.name.split(' ')[0])}`, sub: `Here is what is happening at ${esc(db.settings().name)} today.`,
      actions: `<a class="btn btn--primary btn--sm" href="#/orders?new=1">${icon('plus', { size: 16 })} New order</a><a class="btn btn--ghost btn--sm" href="#/enquiries?new=1">${icon('headset', { size: 16 })} Log enquiry</a><a class="btn btn--ghost btn--sm" href="#/products?new=1">${icon('box', { size: 16 })} Add product</a>` })}
    <section class="kpis" data-stagger>
      ${kpi('Revenue, last 30 days', cur, 'wallet', { pre: '₹', d: delta(cur, prev), series: days.map((d) => d.value) })}
      ${kpi('Orders, last 30 days', curN, 'receipt', { d: delta(curN, prevN), note: 'Confirmed, delivered and completed' })}
      ${kpi('Enquiry conversion', conv, 'headset', { suf: '%', note: `${fresh} new, ${won} won of ${enquiries.length}` })}
      ${kpi('Outstanding balance', balance, 'alert', { pre: '₹', note: 'Unpaid amount on active orders', tone: balance ? 'kpi--warn' : '' })}
    </section>

    <div class="dash">
      <section class="card card--pad" data-reveal>
        <div class="card__head"><h2>Revenue, last 14 days</h2>${user.role === 'owner' ? '<a class="link-detail" href="#/reports">Full report</a>' : ''}</div>
        ${days.some((d) => d.value) ? barChart(days, { label: 'Revenue for the last 14 days' }) : '<p class="muted">No revenue yet in this period.</p>'}
      </section>
      <section class="card card--pad" data-reveal>
        <div class="card__head"><h2>Needs attention</h2></div>
        ${tasks.length ? `<ul class="tasks">${tasks.map((t) => `<li><a href="#/${t.to}"><span class="tasks__ico tasks__ico--${t.tone}">${icon(t.icon, { size: 18 })}</span><span><strong>${t.n}</strong> ${t.label}</span>${icon('arrow', { size: 16 })}</a></li>`).join('')}</ul>` : `<div class="empty-mini">${icon('check', { size: 24 })}<p>You are all caught up.</p></div>`}
      </section>
      <section class="card card--pad" data-reveal>
        <div class="card__head"><h2>Enquiry funnel</h2><a class="link-detail" href="#/enquiries">Open inbox</a></div>
        <ul class="funnel">${stages.map(({ s, n }) => `<li><span class="funnel__label">${pill(s)}</span><span class="funnel__bar"><i style="width:${enquiries.length ? Math.max(4, (n / enquiries.length) * 100) : 0}%"></i></span><b>${n}</b></li>`).join('')}</ul>
      </section>
      <section class="card card--flush" data-reveal>
        <div class="card__head card__head--pad"><h2>Recent orders</h2><a class="link-detail" href="#/orders">View all</a></div>
        ${orders.length ? `<ul class="rows">${orders.slice(0, 5).map((o) => { const c = db.get('customers', o.customerId); return `<li><a href="#/orders/${o.id}">${avatar(c?.name)}<span><strong>${esc(c?.name ?? 'Customer')}</strong><small>${esc(o.invoiceNo)} · ${fmtDate(o.createdAt)}</small></span><span class="rows__end"><b>${inr(o.total)}</b>${pill(o.status)}</span></a></li>`; }).join('')}</ul>` : '<p class="muted card--pad">No orders yet.</p>'}
      </section>
      <section class="card card--flush dash__wide" data-reveal>
        <div class="card__head card__head--pad"><h2>Recent activity</h2>${user.role === 'owner' ? '<a class="link-detail" href="#/activity">Full log</a>' : ''}</div>
        <ul class="feed">${db.all('activity').slice(0, 7).map((a) => `<li><span class="feed__dot"></span><span>${esc(a.text)}<small>${esc(a.by)} · ${timeAgo(a.at)}</small></span></li>`).join('')}</ul>
      </section>
    </div>`;
    initReveal(el);
    el.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('is-in')); // repaint after live updates must not re-hide
    initCountUp(el);
  };
  paint();
  let t;
  onCleanup(db.subscribe(() => { clearTimeout(t); t = setTimeout(paint, 250); }));
  void $;
}
