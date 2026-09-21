import { db } from '../../store.js';
import { $, confirmDialog, dataTable, esc, field, fmtDate, fmtDateTime, formData, icon, inr, modal, pageHead, pill, selectField, toast, validate } from '../ui.js';

const TABS = [['stock', 'Stock levels'], ['moves', 'Movements'], ['po', 'Purchases'], ['sup', 'Suppliers']];
const pname = (id) => db.get('products', id)?.name ?? 'Deleted product';
const sname = (id) => db.get('suppliers', id)?.name ?? 'Supplier';

export default function render({ el, onCleanup, can }) {
  let tab = sessionStorage.getItem('inv.tab') || 'stock';
  let table, source;

  const draw = () => {
    const low = db.allProducts().filter((p) => db.status(p) !== 'in').length;
    el.innerHTML = `${pageHead({ title: 'Inventory', sub: low ? `${low} product${low > 1 ? 's' : ''} low or out of stock.` : 'Stock is healthy.', actions: '<button class="btn btn--primary btn--sm" id="new-po" type="button">New purchase</button>' })}
      <div class="tabs" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${tab === k}">${l}</button>`).join('')}</div><div id="ibody" class="ibody"></div>`;
    const body = $('#ibody', el);
    if (tab === 'stock') {
      source = () => db.allProducts();
      table = dataTable(body, { rows: source(), sort: 'stock', dir: 'asc', pageSize: 10, placeholder: 'Search products…', searchText: (p) => `${p.name} ${p.brand} ${p.sku}`,
        filters: [{ key: 's', label: 'All stock levels', options: [['in', 'In stock'], ['low', 'Low stock'], ['out', 'Out of stock']], test: (p, v) => db.status(p) === v }],
        exportName: 'stock', exportRow: { head: ['SKU', 'Product', 'Stock', 'Status', 'Cost', 'Stock value'], row: (p) => [p.sku, p.name, p.stock, db.status(p), p.cost, p.stock * p.cost] },
        columns: [
          { key: 'n', label: 'Product', sort: (p) => p.name.toLowerCase(), render: (p) => `<div class="cell"><span><strong>${esc(p.name)}</strong><small>${esc(p.sku ?? '')}</small></span></div>` },
          { key: 'stock', label: 'On hand', align: 'right', sort: (p) => p.stock, render: (p) => `<b>${p.stock}</b>` },
          { key: 'st', label: 'Status', sort: (p) => p.stock, render: (p) => pill(db.status(p)) },
          ...(can('profit') ? [{ key: 'val', label: 'Stock value', align: 'right', sort: (p) => p.stock * p.cost, render: (p) => inr(p.stock * p.cost) }] : []),
          { key: 'a', label: '', align: 'right', render: (p) => `<span class="acts"><button class="btn btn--ghost btn--sm" data-adjust="${p.id}">Adjust</button> <button class="btn btn--ghost btn--sm" data-reorder="${p.id}">Reorder</button></span>` },
        ] });
    } else if (tab === 'moves') {
      source = () => db.all('movements');
      table = dataTable(body, { rows: source(), pageSize: 12, placeholder: 'Search reason or product…', searchText: (m) => `${pname(m.productId)} ${m.reason}`, empty: 'No stock movements yet',
        exportName: 'stock-movements', exportRow: { head: ['When', 'Product', 'Change', 'Balance', 'Reason', 'By'], row: (m) => [m.at, pname(m.productId), m.delta, m.balance, m.reason, m.by] },
        columns: [
          { key: 'at', label: 'When', render: (m) => fmtDateTime(m.at) }, { key: 'p', label: 'Product', render: (m) => `<strong>${esc(pname(m.productId))}</strong>` },
          { key: 'd', label: 'Change', align: 'right', render: (m) => `<b class="${m.delta < 0 ? 'due' : 'gain'}">${m.delta > 0 ? '+' : ''}${m.delta}</b>` }, { key: 'b', label: 'Balance', align: 'right', render: (m) => m.balance },
          { key: 'r', label: 'Reason', render: (m) => esc(m.reason) }, { key: 'by', label: 'By', render: (m) => esc(m.by) }] });
    } else if (tab === 'po') {
      source = () => db.all('purchases');
      table = dataTable(body, { rows: source(), pageSize: 10, placeholder: 'Search supplier or product…', searchText: (p) => `${sname(p.supplierId)} ${p.items.map((i) => pname(i.productId)).join(' ')}`, empty: 'No purchases yet',
        emptyAction: '<button class="btn btn--primary btn--sm" data-newpo>Create a purchase order</button>',
        columns: [
          { key: 's', label: 'Supplier', render: (p) => `<strong>${esc(sname(p.supplierId))}</strong>` },
          { key: 'i', label: 'Items', render: (p) => esc(p.items.map((i) => `${i.qty}× ${pname(i.productId)}`).join(', ')) },
          { key: 't', label: 'Cost', align: 'right', render: (p) => inr(p.items.reduce((s, i) => s + i.qty * (i.cost || 0), 0)) },
          { key: 'd', label: 'Ordered', render: (p) => fmtDate(p.createdAt) }, { key: 'st', label: 'Status', render: (p) => pill(p.status) },
          { key: 'a', label: '', align: 'right', render: (p) => (p.status === 'ordered' ? `<span class="acts"><button class="btn btn--primary btn--sm" data-receive="${p.id}">Mark received</button></span>` : '') }] });
    } else {
      source = () => db.all('suppliers');
      table = dataTable(body, { rows: source(), pageSize: 10, placeholder: 'Search suppliers…', searchText: (s) => `${s.name} ${s.contact} ${s.city}`, empty: 'No suppliers yet', emptyAction: '<button class="btn btn--primary btn--sm" data-newsup>Add a supplier</button>',
        toolbarExtra: '<button class="btn btn--primary btn--sm" type="button" data-newsup>Add supplier</button>', onRow: (s) => supplier(s.id),
        columns: [{ key: 'n', label: 'Supplier', sort: (s) => s.name, render: (s) => `<div class="cell"><span><strong>${esc(s.name)}</strong><small>${esc(s.contact)}</small></span></div>` }, { key: 'p', label: 'Phone', render: (s) => esc(s.phone) }, { key: 'e', label: 'Email', render: (s) => esc(s.email) }, { key: 'c', label: 'City', render: (s) => esc(s.city) }] });
    }
  };

  function adjust(id) {
    const p = db.get('products', id);
    modal({
      title: `Adjust stock`, subtitle: `${esc(p.name)} · ${p.stock} on hand`,
      body: `<form id="aform" class="stack" novalidate>${selectField('Type', 'kind', [['in', 'Stock in (+)'], ['out', 'Stock out (−)'], ['set', 'Set exact count']])}${field('Quantity', 'qty', { type: 'number', required: true, attrs: 'min="0" inputmode="numeric"' })}${selectField('Reason', 'reason', ['Recount', 'Damaged', 'Returned by customer', 'Display piece', 'Other'].map((r) => [r, r]))}</form>`,
      footer: '<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit" form="aform">Update stock</button>',
      onMount: ({ el: box, close }) => $('#aform', box).addEventListener('submit', (e) => {
        e.preventDefault(); if (!validate(e.target, { qty: (v) => (Number(v) >= 0 ? '' : 'Enter zero or more.') })) return;
        const f = formData(e.target), q = Number(f.qty);
        const delta = f.kind === 'in' ? q : f.kind === 'out' ? -q : q - p.stock;
        if (p.stock + delta < 0) return toast('Stock cannot go below zero.', { tone: 'error' });
        db.adjustStock(id, delta, `Manual: ${f.reason}`, id); db.log('stock', `Adjusted ${p.name} by ${delta > 0 ? '+' : ''}${delta}`, id); toast('Stock updated'); close();
      }),
    });
  }

  function purchase(preset) {
    const sups = db.all('suppliers'), prods = db.allProducts();
    if (!sups.length) { toast('Add a supplier first.', { tone: 'error' }); tab = 'sup'; draw(); return; }
    const lines = [preset ? { productId: preset.id, qty: Math.max(5, (db.settings().lowStock ?? 3) * 3 - preset.stock), cost: preset.cost } : { productId: '', qty: 1, cost: 0 }];
    modal({
      title: 'New purchase order', subtitle: 'Stock is added only when you mark it received.', wide: true,
      body: `<form id="pform3" class="stack" novalidate>${selectField('Supplier', 'supplierId', sups.map((s) => [s.id, s.name]))}<div id="plines" class="stack"></div><button class="btn btn--ghost btn--sm" type="button" id="addl">${icon('plus', { size: 16 })} Add item</button></form>`,
      footer: '<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit" form="pform3">Create order</button>',
      onMount: ({ el: box, close }) => {
        const drawL = () => { $('#plines', box).innerHTML = lines.map((l, i) => `<div class="line"><select class="input" aria-label="Product" data-p="${i}"><option value="">Choose product…</option>${prods.map((p) => `<option value="${p.id}" ${p.id === l.productId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select><input class="input" type="number" min="1" aria-label="Quantity" data-q="${i}" value="${l.qty}"><input class="input" type="number" min="0" aria-label="Unit cost" data-c="${i}" value="${l.cost}"><button class="icon-btn" type="button" data-x="${i}" aria-label="Remove" ${lines.length < 2 ? 'disabled' : ''}>${icon('close', { size: 18 })}</button></div>`).join(''); };
        drawL();
        $('#plines', box).addEventListener('change', (e) => { if (e.target.dataset.p !== undefined) { const l = lines[e.target.dataset.p]; l.productId = e.target.value; l.cost = db.get('products', e.target.value)?.cost ?? 0; drawL(); } });
        $('#plines', box).addEventListener('input', (e) => { const t = e.target; if (t.dataset.q !== undefined) lines[t.dataset.q].qty = Math.max(1, Number(t.value) || 1); if (t.dataset.c !== undefined) lines[t.dataset.c].cost = Math.max(0, Number(t.value) || 0); });
        $('#plines', box).addEventListener('click', (e) => { const x = e.target.closest('[data-x]'); if (x) { lines.splice(Number(x.dataset.x), 1); drawL(); } });
        $('#addl', box).addEventListener('click', () => { lines.push({ productId: '', qty: 1, cost: 0 }); drawL(); });
        $('#pform3', box).addEventListener('submit', (e) => {
          e.preventDefault();
          const items = lines.filter((l) => l.productId);
          if (!items.length) return toast('Add at least one product.', { tone: 'error' });
          db.createPurchase({ supplierId: e.target.supplierId.value, items }); toast('Purchase order created'); close(); tab = 'po'; draw();
        });
      },
    });
  }

  function supplier(id) {
    const s = id ? db.get('suppliers', id) : null;
    modal({
      title: s ? s.name : 'Add supplier',
      body: `<form id="supform" class="stack" novalidate>${field('Company', 'name', { value: s?.name, required: true })}<div class="row2">${field('Contact person', 'contact', { value: s?.contact })}${field('Phone', 'phone', { value: s?.phone, type: 'tel' })}</div><div class="row2">${field('Email', 'email', { value: s?.email, type: 'email' })}${field('City', 'city', { value: s?.city })}</div></form>`,
      footer: `${s && can('delete') ? '<button class="btn btn--danger" type="button" id="rms">Delete</button>' : ''}<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit" form="supform">Save</button>`,
      onMount: ({ el: box, close }) => {
        $('#supform', box).addEventListener('submit', (e) => { e.preventDefault(); if (!validate(e.target)) return; db.put('suppliers', { ...(s ? { id } : {}), ...formData(e.target) }); toast('Supplier saved'); close(); });
        $('#rms', box)?.addEventListener('click', async () => { close(); if (await confirmDialog({ title: `Delete ${s.name}?`, text: 'Past purchases keep the name. You can undo right after.', confirm: 'Delete', danger: true })) { const gone = db.del('suppliers', id); toast('Supplier deleted', { undo: () => db.restore('suppliers', gone) }); } });
      },
    });
  }

  el.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (t) { tab = t.dataset.tab; sessionStorage.setItem('inv.tab', tab); draw(); return; }
    if (e.target.closest('#new-po, [data-newpo]')) purchase();
    if (e.target.closest('[data-newsup]')) supplier(null);
    const a = e.target.closest('[data-adjust]'); if (a) adjust(a.dataset.adjust);
    const r = e.target.closest('[data-reorder]'); if (r) purchase(db.get('products', r.dataset.reorder));
    const rc = e.target.closest('[data-receive]');
    if (rc) { db.receivePurchase(rc.dataset.receive); toast('Received. Stock updated.'); }
  });
  draw();
  onCleanup(db.subscribe(() => table?.refresh(source())));
}
