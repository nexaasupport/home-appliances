import { db } from '../../store.js';
import { $, $$, avatar, confirmDialog, dataTable, drawer, esc, field, fmtDate, fmtDateTime, go, icon, inr, modal, pageHead, pill, selectField, textArea, today, toast, validate } from '../ui.js';

const METHODS = ['Cash', 'UPI', 'Card', 'Bank transfer', 'EMI'];
const STATUSES = ['quote', 'confirmed', 'delivered', 'completed', 'cancelled'];
const NEXT = { quote: ['confirmed', 'Confirm order'], confirmed: ['delivered', 'Mark delivered'], delivered: ['completed', 'Complete order'] };
const cust = (o) => db.get('customers', o.customerId);

export default function render(ctx) {
  return ctx.id ? detail(ctx) : list(ctx);
}

// ============================ LIST ============================
function list({ el, query, onCleanup }) {
  const rows = () => db.all('orders');
  el.innerHTML = `${pageHead({ title: 'Orders', sub: 'Quotes, confirmed sales and invoices in one place.', actions: `<button class="btn btn--primary btn--sm" type="button" id="new">${icon('plus', { size: 16 })} New order</button>` })}<div id="tbl"></div>`;
  const table = dataTable($('#tbl', el), {
    rows: rows(), sort: 'date', dir: 'desc', pageSize: 10, placeholder: 'Search invoice number or customer…',
    searchText: (o) => `${o.invoiceNo} ${cust(o)?.name ?? ''} ${cust(o)?.phone ?? ''} ${o.items.map((i) => i.name).join(' ')}`,
    filters: [{ key: 'status', label: 'All statuses', options: STATUSES.map((s) => [s, s[0].toUpperCase() + s.slice(1)]), test: (o, v) => o.status === v },
      { key: 'pay', label: 'All payments', options: [['unpaid', 'Unpaid'], ['partial', 'Part paid'], ['paid', 'Paid']], test: (o, v) => db.orderPayment(o) === v }],
    exportName: 'orders', exportRow: { head: ['Invoice', 'Date', 'Customer', 'Phone', 'Items', 'Total', 'Paid', 'Status'], row: (o) => [o.invoiceNo, o.createdAt.slice(0, 10), cust(o)?.name, cust(o)?.phone, o.items.map((i) => `${i.qty}× ${i.name}`).join('; '), o.total, db.orderPaid(o), o.status] },
    onRow: (o) => go(`orders/${o.id}`),
    empty: 'No orders yet', emptyAction: '<button class="btn btn--primary btn--sm" type="button" data-new>Create the first order</button>',
    columns: [
      { key: 'inv', label: 'Invoice', sort: (o) => o.invoiceNo, render: (o) => `<strong>${esc(o.invoiceNo)}</strong>` },
      { key: 'cust', label: 'Customer', sort: (o) => cust(o)?.name ?? '', render: (o) => `<div class="cell">${avatar(cust(o)?.name)}<span><strong>${esc(cust(o)?.name ?? 'Customer')}</strong><small>${esc(o.items.map((i) => `${i.qty}× ${i.name}`).join(', ').slice(0, 44))}</small></span></div>` },
      { key: 'total', label: 'Total', align: 'right', sort: (o) => o.total, render: (o) => inr(o.total) },
      { key: 'pay', label: 'Payment', sort: (o) => db.orderPaid(o) / (o.total || 1), render: (o) => (o.status === 'cancelled' ? '—' : pill(db.orderPayment(o))) },
      { key: 'status', label: 'Status', sort: (o) => STATUSES.indexOf(o.status), render: (o) => pill(o.status) },
      { key: 'date', label: 'Date', sort: (o) => o.createdAt, render: (o) => fmtDate(o.createdAt) },
    ],
  });
  el.addEventListener('click', (e) => { if (e.target.closest('#new, [data-new]')) editor({}); });
  if (query.new) editor({ enquiryId: query.enquiry, customerId: query.customer, productId: query.product });
  onCleanup(db.subscribe(() => table.refresh(rows())));
}

// ============================ EDITOR (create / edit quote) ============================
export function editor({ order, enquiryId, customerId, productId } = {}) {
  const enq = enquiryId ? db.get('enquiries', enquiryId) : null;
  const existing = order ?? null;
  const base = existing ? cust(existing) : customerId ? db.get('customers', customerId) : enq?.customerId ? db.get('customers', enq.customerId) : null;
  const startProduct = productId || enq?.productId;
  const lines = existing ? existing.items.map((i) => ({ ...i })) : startProduct && db.get('products', startProduct) ? [{ productId: startProduct, qty: 1, price: db.get('products', startProduct).price }] : [{ productId: '', qty: 1, price: 0 }];
  const prods = db.allProducts();
  let discount = existing?.discount ?? 0;

  modal({
    title: existing ? `Edit ${existing.invoiceNo}` : 'New order', subtitle: enq ? `From enquiry by ${esc(enq.name)}` : 'Build a quote. Stock moves only when you confirm it.', wide: true,
    body: `<form id="oform" class="stack" novalidate>
      <fieldset class="fset"><legend>Customer</legend>
        ${!existing ? selectField('Existing customer', 'customerId', [['', 'New customer…'], ...db.all('customers').map((c) => [c.id, `${c.name} · ${c.phone}`])], base?.id ?? '') : ''}
        <div class="row2" id="newcust">${field('Name', 'name', { value: base?.name ?? enq?.name ?? '', required: true })}${field('Phone', 'phone', { type: 'tel', value: base?.phone ?? enq?.phone ?? '', required: true })}</div></fieldset>
      <fieldset class="fset"><legend>Items</legend><div id="lines" class="stack"></div><button class="btn btn--ghost btn--sm" type="button" id="add-line">${icon('plus', { size: 16 })} Add item</button></fieldset>
      <div class="row2">${field('Discount (₹)', 'discount', { type: 'number', value: discount || '', attrs: 'min="0" inputmode="numeric"' })}<div class="total-box"><span>Total</span><strong id="tot">₹0</strong></div></div>
      <fieldset class="fset"><legend>Delivery and payment</legend>
        <div class="row2">${field('Delivery address', 'address', { value: existing?.delivery?.address ?? base?.address ?? '' })}${field('Delivery date', 'date', { type: 'date', value: existing?.delivery?.date ?? '' })}</div>
        ${!existing ? `<div class="row2">${field('Advance received (₹)', 'advance', { type: 'number', attrs: 'min="0" inputmode="numeric"' })}${selectField('Method', 'method', METHODS.map((m) => [m, m]))}</div>` : ''}
        ${textArea('Notes', 'notes', existing?.notes ?? '', { rows: 2 })}</fieldset></form>`,
    footer: `<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit" form="oform">${existing ? 'Save changes' : 'Create quote'}</button>`,
    onMount: ({ el: box, close }) => {
      const form = $('#oform', box);
      const totals = () => { const sub = lines.reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0); $('#tot', box).textContent = inr(Math.max(0, sub - (Number(form.discount.value) || 0))); };
      const drawLines = () => {
        $('#lines', box).innerHTML = lines.map((l, i) => `<div class="line"><select class="input" aria-label="Product" data-p="${i}"><option value="">Choose product…</option>${prods.map((p) => `<option value="${p.id}" ${p.id === l.productId ? 'selected' : ''}>${esc(p.name)} (${p.stock} in stock)</option>`).join('')}</select>
          <input class="input" type="number" min="1" aria-label="Quantity" data-q="${i}" value="${l.qty}"><input class="input" type="number" min="0" aria-label="Unit price" data-r="${i}" value="${l.price}"><button class="icon-btn" type="button" data-x="${i}" aria-label="Remove item" ${lines.length < 2 ? 'disabled' : ''}>${icon('close', { size: 18 })}</button></div>`).join('');
        totals();
      };
      drawLines();
      $('#lines', box).addEventListener('change', (e) => {
        const t = e.target;
        if (t.dataset.p !== undefined) { const p = db.get('products', t.value); const l = lines[t.dataset.p]; l.productId = t.value; l.price = p?.price ?? 0; drawLines(); }
      });
      $('#lines', box).addEventListener('input', (e) => {
        const t = e.target;
        if (t.dataset.q !== undefined) lines[t.dataset.q].qty = Math.max(1, Number(t.value) || 1);
        if (t.dataset.r !== undefined) lines[t.dataset.r].price = Math.max(0, Number(t.value) || 0);
        totals();
      });
      $('#lines', box).addEventListener('click', (e) => { const x = e.target.closest('[data-x]'); if (x && lines.length > 1) { lines.splice(Number(x.dataset.x), 1); drawLines(); } });
      $('#add-line', box).addEventListener('click', () => { lines.push({ productId: '', qty: 1, price: 0 }); drawLines(); });
      form.discount.addEventListener('input', totals);
      form.customerId?.addEventListener('change', () => {
        const c = db.get('customers', form.customerId.value);
        form.name.value = c?.name ?? ''; form.phone.value = c?.phone ?? ''; form.address.value = c?.address ?? '';
        form.name.readOnly = form.phone.readOnly = Boolean(c);
      });
      if (base && !existing) { form.name.readOnly = form.phone.readOnly = true; }
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const okForm = validate(form, { phone: (v) => (/^[+\d][\d\s-]{8,14}$/.test(v.trim()) ? '' : 'Enter a valid phone number.') });
        const items = lines.filter((l) => l.productId).map((l) => ({ productId: l.productId, name: db.get('products', l.productId).name, qty: l.qty, price: l.price }));
        if (!okForm) return;
        if (!items.length) return toast('Add at least one product.', { tone: 'error' });
        const delivery = { address: form.address.value.trim(), date: form.date.value };
        const disc = Number(form.discount.value) || 0;
        if (existing) {
          const c = db.upsertCustomer({ name: form.name.value, phone: form.phone.value, address: delivery.address });
          db.updateOrder(existing.id, { customerId: c.id, items, discount: disc, delivery, notes: form.notes.value });
          db.log('order', `Edited quote ${existing.invoiceNo}`, existing.id);
          toast('Quote updated'); close(); return;
        }
        const advance = Number(form.advance?.value) || 0;
        const row = db.createOrder({ customer: form.customerId.value ? { id: form.customerId.value } : { name: form.name.value, phone: form.phone.value, address: delivery.address }, items, discount: disc, delivery, notes: form.notes.value, advance: advance ? { amount: advance, method: form.method.value } : null, enquiryId });
        toast(`Quote ${row.invoiceNo} created`); close(); go(`orders/${row.id}`);
      });
    },
  });
}

// ============================ DETAIL ============================
function detail({ el, id, onCleanup, can }) {
  const paint = () => {
    const o = db.get('orders', id);
    if (!o) { el.innerHTML = `<div class="empty-state empty-state--page"><span class="empty-state__icon">${icon('receipt', { size: 28 })}</span><h3>Order not found</h3><p>It may have been deleted.</p><a class="btn btn--primary" href="#/orders">Back to orders</a></div>`; return; }
    const c = cust(o), paid = db.orderPaid(o), due = Math.max(0, o.total - paid), next = NEXT[o.status];
    const active = o.status !== 'cancelled';
    const svc = db.all('services').filter((s) => s.orderId === o.id);
    el.innerHTML = `
      <a class="back" href="#/orders">${icon('arrow', { size: 16 })} All orders</a>
      ${pageHead({ title: `${esc(o.invoiceNo)} ${pill(o.status)}`, sub: `Created ${fmtDateTime(o.createdAt)}${o.enquiryId ? ' from an enquiry' : ''}`,
        actions: `${o.status === 'quote' ? `<button class="btn btn--ghost btn--sm" id="edit">${icon('edit', { size: 16 })} Edit</button>` : ''}
          <button class="btn btn--ghost btn--sm" id="print">${icon('receipt', { size: 16 })} Invoice</button>
          ${active && due > 0 && o.status !== 'quote' ? `<button class="btn btn--ghost btn--sm" id="pay">${icon('wallet', { size: 16 })} Record payment</button>` : ''}
          ${next ? `<button class="btn btn--primary btn--sm" id="next">${next[1]}</button>` : ''}
          ${active && o.status !== 'completed' ? '<button class="btn btn--danger btn--sm" id="cancel">Cancel order</button>' : ''}` })}
      <div class="odetail">
        <div class="stack">
          <section class="card card--flush"><div class="card__head card__head--pad"><h2>Items</h2></div>
            <div class="table-wrap"><table class="table"><thead><tr><th>Product</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
            <tbody>${o.items.map((i) => `<tr><td><strong>${esc(i.name)}</strong></td><td class="num">${i.qty}</td><td class="num">${inr(i.price)}</td><td class="num">${inr(i.qty * i.price)}</td></tr>`).join('')}</tbody></table></div>
            <dl class="sum"><div><dt>Subtotal</dt><dd>${inr(o.subtotal)}</dd></div>${o.discount ? `<div><dt>Discount</dt><dd>− ${inr(o.discount)}</dd></div>` : ''}<div class="sum__total"><dt>Total</dt><dd>${inr(o.total)}</dd></div><div><dt>Paid</dt><dd>${inr(paid)}</dd></div><div class="${due ? 'sum__due' : ''}"><dt>Balance</dt><dd>${inr(due)}</dd></div></dl></section>
          <section class="card card--pad"><div class="card__head"><h2>Payments</h2>${active ? pill(db.orderPayment(o)) : ''}</div>
            ${(o.payments ?? []).length ? `<ul class="plain">${o.payments.map((p) => `<li><span>${esc(p.method)}${p.note ? ` · ${esc(p.note)}` : ''}<small>${fmtDate(p.date)}</small></span><b>${inr(p.amount)}</b></li>`).join('')}</ul>` : '<p class="muted">No payments recorded yet.</p>'}</section>
        </div>
        <div class="stack">
          <section class="card card--pad"><div class="card__head"><h2>Customer</h2><a class="link-detail" href="#/customers?open=${o.customerId}">Profile</a></div>
            <div class="cell">${avatar(c?.name)}<span><strong>${esc(c?.name ?? '')}</strong><small>${esc(c?.phone ?? '')}</small></span></div>
            <div class="kv"><div class="kv__full"><span>Delivery address</span><b>${esc(o.delivery?.address || '—')}</b></div><div><span>Delivery date</span><b>${o.delivery?.date ? fmtDate(o.delivery.date) : '—'}</b></div><div><span>Notes</span><b>${esc(o.notes || '—')}</b></div></div></section>
          <section class="card card--pad"><div class="card__head"><h2>Timeline</h2></div>
            <ol class="timeline">${(o.history ?? []).map((h) => `<li><span class="timeline__dot"></span><div>${pill(h.status)}<small>${fmtDateTime(h.at)} · ${esc(h.by)}</small></div></li>`).join('')}</ol></section>
          <section class="card card--pad"><div class="card__head"><h2>Service</h2>${active ? '<button class="btn btn--ghost btn--sm" id="svc">Schedule</button>' : ''}</div>
            ${svc.length ? `<ul class="plain">${svc.map((s) => `<li><span>${esc(s.type[0].toUpperCase() + s.type.slice(1))}<small>${s.date ? fmtDate(s.date) : 'No date'} · ${esc(s.technician || 'Unassigned')}</small></span>${pill(s.status)}</li>`).join('')}</ul>` : '<p class="muted">No delivery or installation booked.</p>'}</section>
        </div>
      </div>`;
    $('#edit', el)?.addEventListener('click', () => editor({ order: o }));
    $('#print', el)?.addEventListener('click', () => invoice(o.id));
    $('#pay', el)?.addEventListener('click', () => payment(o));
    $('#svc', el)?.addEventListener('click', () => scheduleService(o));
    $('#next', el)?.addEventListener('click', () => {
      const r = db.setOrderStatus(o.id, next[0]);
      if (!r.ok) return toast(r.error, { tone: 'error' });
      toast(`Order ${next[0]}${next[0] === 'confirmed' ? '. Stock updated.' : ''}`);
    });
    $('#cancel', el)?.addEventListener('click', async () => {
      const ok = await confirmDialog({ title: `Cancel ${o.invoiceNo}?`, text: o.reserved ? 'Reserved stock returns to inventory.' : 'This quote will be marked cancelled.', confirm: 'Cancel order', danger: true });
      if (ok) { db.setOrderStatus(o.id, 'cancelled'); toast('Order cancelled'); }
    });
  };
  paint();
  onCleanup(db.subscribe(paint));
  void can;
}

function payment(o) {
  const due = Math.max(0, o.total - db.orderPaid(o));
  modal({
    title: 'Record payment', subtitle: `${esc(o.invoiceNo)} · balance ${inr(due)}`,
    body: `<form id="pform2" class="stack" novalidate>${field('Amount (₹)', 'amount', { type: 'number', value: due, required: true, attrs: `min="1" max="${due}" inputmode="numeric"` })}${selectField('Method', 'method', METHODS.map((m) => [m, m]))}${field('Reference or note', 'note')}</form>`,
    footer: '<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit" form="pform2">Save payment</button>',
    onMount: ({ el, close }) => $('#pform2', el).addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate(e.target, { amount: (v) => (Number(v) > 0 && Number(v) <= due ? '' : `Enter an amount up to ${inr(due)}.`) })) return;
      db.addPayment(o.id, { amount: Number(e.target.amount.value), method: e.target.method.value, note: e.target.note.value });
      toast('Payment recorded'); close();
    }),
  });
}

export function scheduleService(o, presetType = 'delivery') {
  const c = cust(o);
  modal({
    title: 'Schedule service', subtitle: `${esc(o.invoiceNo)} · ${esc(c?.name ?? '')}`,
    body: `<form id="sform" class="stack" novalidate>${selectField('Type', 'type', [['delivery', 'Delivery'], ['installation', 'Installation'], ['repair', 'Repair'], ['warranty', 'Warranty claim'], ['exchange', 'Exchange']], presetType)}
      ${selectField('Product', 'productId', o.items.map((i) => [i.productId, i.name]))}<div class="row2">${field('Date', 'date', { type: 'date', value: o.delivery?.date || today() })}${field('Technician', 'technician')}</div>${textArea('Notes', 'notes', '', { rows: 2 })}</form>`,
    footer: '<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit" form="sform">Schedule</button>',
    onMount: ({ el, close }) => $('#sform', el).addEventListener('submit', (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      db.put('services', { ...f, customerId: o.customerId, orderId: o.id, status: 'scheduled' });
      db.log('service', `Scheduled ${f.type} for ${c?.name ?? 'customer'} (${o.invoiceNo})`, o.id);
      toast('Service scheduled'); close();
    }),
  });
}

// ============================ INVOICE (print) ============================
export function invoice(orderId) {
  const o = db.get('orders', orderId), c = cust(o), s = db.settings();
  const paid = db.orderPaid(o), due = Math.max(0, o.total - paid);
  const m = modal({
    title: `Invoice ${o.invoiceNo}`, wide: true,
    body: `<article class="inv" id="inv">
      <header class="inv__head"><div><h3>${esc(s.name)}</h3><p>${esc(s.address)}<br>${esc(s.phone)} · ${esc(s.email)}${s.gstin ? `<br>GSTIN ${esc(s.gstin)}` : ''}</p></div><div class="inv__meta"><strong>INVOICE</strong><span>${esc(o.invoiceNo)}</span><span>${fmtDate(o.createdAt)}</span></div></header>
      <div class="inv__bill"><span>Bill to</span><strong>${esc(c?.name ?? '')}</strong><p>${esc(c?.phone ?? '')}<br>${esc(o.delivery?.address || c?.address || '')}</p></div>
      <table class="inv__table"><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${o.items.map((i) => `<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${inr(i.price)}</td><td>${inr(i.qty * i.price)}</td></tr>`).join('')}</tbody></table>
      <dl class="inv__sum"><div><dt>Subtotal</dt><dd>${inr(o.subtotal)}</dd></div>${o.discount ? `<div><dt>Discount</dt><dd>− ${inr(o.discount)}</dd></div>` : ''}<div class="inv__grand"><dt>Total</dt><dd>${inr(o.total)}</dd></div><div><dt>Paid</dt><dd>${inr(paid)}</dd></div><div><dt>Balance due</dt><dd>${inr(due)}</dd></div></dl>
      <footer class="inv__foot">${esc(s.invoiceFooter)}</footer></article>`,
    footer: `<button class="btn btn--ghost" type="button" data-close>Close</button><button class="btn btn--primary" type="button" id="do-print">${icon('receipt', { size: 16 })} Print / Save PDF</button>`,
    onMount: ({ el }) => $('#do-print', el).addEventListener('click', () => print()),
  });
  m.el.classList.add('ov--invoice');
  void $$;
  void drawer;
}
