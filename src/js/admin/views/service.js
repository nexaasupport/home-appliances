import { db } from '../../store.js';
import { $, dataTable, esc, field, fmtDate, formData, icon, modal, pageHead, pill, selectField, textArea, toast, today, validate, confirmDialog } from '../ui.js';

const TYPES = [['delivery', 'Delivery'], ['installation', 'Installation'], ['repair', 'Repair'], ['warranty', 'Warranty claim'], ['exchange', 'Exchange']];
const STATES = [['open', 'Open'], ['scheduled', 'Scheduled'], ['inprogress', 'In progress'], ['done', 'Done']];
const cname = (s) => db.get('customers', s.customerId)?.name ?? 'Customer';
const pname = (s) => db.get('products', s.productId)?.name ?? '';
const label = (v) => TYPES.find((t) => t[0] === v)?.[1] ?? v;

export default function render({ el, query, onCleanup, can }) {
  let mode = sessionStorage.getItem('svc.mode') || 'board';
  let table;
  const rows = () => db.all('services');

  const draw = () => {
    const data = rows();
    el.innerHTML = `${pageHead({ title: 'Service requests', sub: 'Deliveries, installations, repairs and warranty claims.', actions: `<div class="tabs" role="tablist" aria-label="View"><button type="button" role="tab" data-mode="board" aria-selected="${mode === 'board'}">Board</button><button type="button" role="tab" data-mode="list" aria-selected="${mode === 'list'}">List</button></div><button class="btn btn--primary btn--sm" id="add" type="button">${icon('plus', { size: 16 })} New request</button>` })}<div id="sbody"></div>`;
    const body = $('#sbody', el);
    if (mode === 'board') {
      table = null;
      body.innerHTML = `<div class="board board--4">${STATES.map(([k, l]) => { const items = data.filter((s) => s.status === k); return `<section class="board__col"><h2>${pill(k)}<span>${items.length}</span></h2><div class="board__list">${items.map((s) => `<button type="button" class="bcard" data-open="${s.id}"><strong>${esc(label(s.type))} · ${esc(cname(s))}</strong><span>${esc(pname(s) || 'No product')}</span><small>${s.date ? fmtDate(s.date) : 'No date'} · ${esc(s.technician || 'Unassigned')}</small></button>`).join('') || '<p class="board__none">Nothing here</p>'}</div></section>`; }).join('')}</div>`;
    } else {
      table = dataTable(body, {
        rows: data, sort: 'date', dir: 'asc', pageSize: 10, placeholder: 'Search customer, product, technician…',
        searchText: (s) => `${cname(s)} ${pname(s)} ${s.technician} ${s.type}`,
        filters: [{ key: 't', label: 'All types', options: TYPES, test: (s, v) => s.type === v }, { key: 's', label: 'All statuses', options: STATES, test: (s, v) => s.status === v }],
        exportName: 'service-requests', exportRow: { head: ['Type', 'Customer', 'Product', 'Date', 'Technician', 'Status'], row: (s) => [s.type, cname(s), pname(s), s.date, s.technician, s.status] },
        onRow: (s) => open(s.id), empty: 'No service requests',
        columns: [
          { key: 'type', label: 'Request', sort: (s) => s.type, render: (s) => `<div class="cell"><span><strong>${esc(label(s.type))}</strong><small>${esc(pname(s) || '—')}</small></span></div>` },
          { key: 'cust', label: 'Customer', sort: (s) => cname(s), render: (s) => esc(cname(s)) },
          { key: 'date', label: 'Date', sort: (s) => s.date || '9999', render: (s) => (s.date ? fmtDate(s.date) : '—') },
          { key: 'tech', label: 'Technician', render: (s) => esc(s.technician || 'Unassigned') },
          { key: 'status', label: 'Status', sort: (s) => STATES.findIndex((x) => x[0] === s.status), render: (s) => pill(s.status) },
        ],
      });
    }
  };

  function open(id) {
    const s = id ? db.get('services', id) : null;
    const customers = db.all('customers');
    modal({
      title: s ? `${label(s.type)} · ${cname(s)}` : 'New service request', subtitle: s?.orderId ? `Linked to ${esc(db.get('orders', s.orderId)?.invoiceNo ?? 'an order')}` : '',
      body: `<form id="svform" class="stack" novalidate>
        ${s ? '' : selectField('Customer', 'customerId', customers.map((c) => [c.id, `${c.name} · ${c.phone}`]), '', { required: true })}
        <div class="row2">${selectField('Type', 'type', TYPES, s?.type ?? 'repair')}${selectField('Status', 'status', STATES, s?.status ?? 'open')}</div>
        ${selectField('Product', 'productId', [['', 'Not specified'], ...db.allProducts().map((p) => [p.id, p.name])], s?.productId ?? '')}
        <div class="row2">${field('Date', 'date', { type: 'date', value: s?.date ?? today() })}${field('Technician', 'technician', { value: s?.technician ?? '' })}</div>${textArea('Notes', 'notes', s?.notes ?? '', { rows: 3 })}</form>`,
      footer: `${s && can('delete') ? '<button class="btn btn--danger" type="button" id="rm">Delete</button>' : ''}<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit" form="svform">${s ? 'Save' : 'Create'}</button>`,
      onMount: ({ el: box, close }) => {
        $('#svform', box).addEventListener('submit', (e) => {
          e.preventDefault(); if (!validate(e.target)) return;
          const f = formData(e.target);
          if (s) { db.put('services', { id: s.id, ...f }); db.log('service', `Updated ${f.type} request for ${cname(s)}`, s.id); }
          else { const r = db.put('services', f); db.log('service', `New ${f.type} request for ${cname(r)}`, r.id); }
          toast('Service request saved'); close();
        });
        $('#rm', box)?.addEventListener('click', async () => { close(); if (await confirmDialog({ title: 'Delete this request?', text: 'You can undo right after.', confirm: 'Delete', danger: true })) { const gone = db.del('services', s.id); toast('Deleted', { undo: () => db.restore('services', gone) }); } });
      },
    });
  }

  el.addEventListener('click', (e) => {
    const m = e.target.closest('[data-mode]');
    if (m) { mode = m.dataset.mode; sessionStorage.setItem('svc.mode', mode); draw(); return; }
    if (e.target.closest('#add')) open(null);
    const o = e.target.closest('[data-open]');
    if (o) open(o.dataset.open);
  });
  draw();
  if (query.new) open(null);
  onCleanup(db.subscribe(() => (table ? table.refresh(rows()) : draw())));
}
