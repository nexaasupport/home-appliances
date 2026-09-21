import { db } from '../../store.js';
import { $, avatar, dataTable, drawer, esc, field, fmtDate, formData, go, icon, inr, modal, pageHead, pill, textArea, toast, validate } from '../ui.js';

const BOOKED = new Set(['confirmed', 'delivered', 'completed']);
const stats = (c) => {
  const orders = db.all('orders').filter((o) => o.customerId === c.id);
  const value = orders.filter((o) => BOOKED.has(o.status)).reduce((s, o) => s + o.total, 0);
  const owed = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Math.max(0, o.total - db.orderPaid(o)), 0);
  return { orders, value, owed };
};

export default function render({ el, query, onCleanup }) {
  const rows = () => db.all('customers').map((c) => ({ ...c, ...stats(c) }));
  el.innerHTML = `${pageHead({ title: 'Customers', sub: 'Merged automatically by phone number. Every enquiry and order links back here.', actions: `<button class="btn btn--primary btn--sm" type="button" id="add">${icon('plus', { size: 16 })} Add customer</button>` })}<div id="tbl"></div>`;
  const table = dataTable($('#tbl', el), {
    rows: rows(), sort: 'value', dir: 'desc', pageSize: 10, placeholder: 'Search name, phone, email…',
    searchText: (c) => `${c.name} ${c.phone} ${c.email} ${c.address}`,
    filters: [{ key: 'due', label: 'All customers', options: [['owes', 'Has balance due'], ['repeat', 'Repeat buyers']], test: (c, v) => (v === 'owes' ? c.owed > 0 : c.orders.length > 1) }],
    exportName: 'customers', exportRow: { head: ['Name', 'Phone', 'Email', 'Address', 'Orders', 'Lifetime value', 'Balance due'], row: (c) => [c.name, c.phone, c.email, c.address, c.orders.length, c.value, c.owed] },
    onRow: (c) => profile(c.id),
    empty: 'No customers yet', emptyAction: '<button class="btn btn--primary btn--sm" type="button" data-add>Add a customer</button>',
    columns: [
      { key: 'name', label: 'Customer', sort: (c) => c.name.toLowerCase(), render: (c) => `<div class="cell">${avatar(c.name)}<span><strong>${esc(c.name)}</strong><small>${esc(c.phone)}</small></span></div>` },
      { key: 'city', label: 'Address', render: (c) => esc(c.address || '—') },
      { key: 'orders', label: 'Orders', align: 'right', sort: (c) => c.orders.length, render: (c) => c.orders.length },
      { key: 'value', label: 'Lifetime value', align: 'right', sort: (c) => c.value, render: (c) => inr(c.value) },
      { key: 'owed', label: 'Balance due', align: 'right', sort: (c) => c.owed, render: (c) => (c.owed ? `<b class="due">${inr(c.owed)}</b>` : '—') },
    ],
  });

  function profile(id) {
    const c = db.get('customers', id);
    if (!c) return;
    const s = stats(c);
    const enq = db.all('enquiries').filter((e) => e.customerId === id || (c.phone && e.phone === c.phone));
    const svc = db.all('services').filter((x) => x.customerId === id);
    drawer({
      title: c.name, subtitle: `Customer since ${fmtDate(c.createdAt)}`, wide: true,
      body: `<div class="mini-stats"><div><span>Lifetime value</span><b>${inr(s.value)}</b></div><div><span>Orders</span><b>${s.orders.length}</b></div><div><span>Balance due</span><b class="${s.owed ? 'due' : ''}">${inr(s.owed)}</b></div></div>
        <form id="cform" class="stack" novalidate><div class="row2">${field('Name', 'name', { value: c.name, required: true })}${field('Phone', 'phone', { value: c.phone, type: 'tel', required: true })}</div>${field('Email', 'email', { value: c.email, type: 'email' })}${textArea('Address', 'address', c.address, { rows: 2 })}</form>
        <h3 class="sub">Orders</h3>${s.orders.length ? `<ul class="plain">${s.orders.map((o) => `<li><a href="#/orders/${o.id}" data-close><strong>${esc(o.invoiceNo)}</strong><small>${fmtDate(o.createdAt)} · ${inr(o.total)}</small></a>${pill(o.status)}</li>`).join('')}</ul>` : '<p class="muted">No orders yet.</p>'}
        <h3 class="sub">Enquiries</h3>${enq.length ? `<ul class="plain">${enq.map((e) => `<li><span><strong>${esc(e.topic)}</strong><small>${fmtDate(e.createdAt)}</small></span>${pill(e.status)}</li>`).join('')}</ul>` : '<p class="muted">None.</p>'}
        <h3 class="sub">Service history</h3>${svc.length ? `<ul class="plain">${svc.map((x) => `<li><span><strong>${esc(x.type)}</strong><small>${x.date ? fmtDate(x.date) : 'No date'}</small></span>${pill(x.status)}</li>`).join('')}</ul>` : '<p class="muted">None.</p>'}`,
      footer: '<button class="btn btn--ghost" type="button" id="neworder">New order</button><button class="btn btn--primary" type="submit" form="cform">Save</button>',
      onMount: ({ el: box, close }) => {
        $('#cform', box).addEventListener('submit', (e) => { e.preventDefault(); if (!validate(e.target)) return; db.put('customers', { id, ...formData(e.target) }); db.log('customer', `Updated customer ${e.target.name.value}`, id); toast('Customer saved'); close(); });
        $('#neworder', box).addEventListener('click', () => { close(); go(`orders?new=1&customer=${id}`); });
      },
    });
  }

  function add() {
    modal({
      title: 'Add customer', body: `<form id="nform" class="stack" novalidate>${field('Name', 'name', { required: true })}${field('Phone', 'phone', { type: 'tel', required: true })}${field('Email', 'email', { type: 'email' })}${textArea('Address', 'address', '', { rows: 2 })}</form>`,
      footer: '<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit" form="nform">Add</button>',
      onMount: ({ el: box, close }) => $('#nform', box).addEventListener('submit', (e) => { e.preventDefault(); if (!validate(e.target)) return; const c = db.upsertCustomer(formData(e.target)); toast('Customer added'); close(); setTimeout(() => profile(c.id), 250); }),
    });
  }

  el.addEventListener('click', (e) => { if (e.target.closest('#add, [data-add]')) add(); });
  if (query.open) profile(query.open);
  onCleanup(db.subscribe(() => table.refresh(rows())));
}
