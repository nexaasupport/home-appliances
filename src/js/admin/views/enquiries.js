import { db } from '../../store.js';
import { $, $$, dataTable, drawer, esc, field, fmtDateTime, formData, go, icon, modal, pageHead, pill, selectField, textArea, timeAgo, toast, validate, avatar } from '../ui.js';

const STAGES = ['new', 'contacted', 'quoted', 'won', 'lost'];
const SOURCES = { website: 'Website', 'contact-form': 'Contact form', phone: 'Phone call', 'walk-in': 'Walk-in', whatsapp: 'WhatsApp' };
const TOPICS = ['Product enquiry', 'Price or offer', 'Delivery or installation', 'Service or repair', 'Other'];
const digits = (p) => String(p ?? '').replace(/\D/g, '');

export default function render({ el, query, onCleanup }) {
  let mode = sessionStorage.getItem('enq.mode') || 'list';
  let table;

  const productName = (e) => (e.productId ? db.get('products', e.productId)?.name ?? '' : '');
  const rows = () => db.all('enquiries');

  const draw = () => {
    const data = rows();
    el.innerHTML = `
      ${pageHead({ title: 'Enquiries', sub: `${data.filter((e) => e.status === 'new').length} new · ${data.length} in total. Website leads land here automatically.`,
        actions: `<div class="tabs" role="tablist" aria-label="View"><button type="button" role="tab" data-mode="list" aria-selected="${mode === 'list'}">List</button><button type="button" role="tab" data-mode="board" aria-selected="${mode === 'board'}">Board</button></div><button class="btn btn--primary btn--sm" type="button" id="log">${icon('plus', { size: 16 })} Log enquiry</button>` })}
      <div id="enq-body"></div>`;
    const body = $('#enq-body', el);
    if (mode === 'board') {
      body.innerHTML = `<div class="board">${STAGES.map((s) => { const items = data.filter((e) => e.status === s); return `<section class="board__col"><h2>${pill(s)}<span>${items.length}</span></h2><div class="board__list">${items.map((e) => card(e)).join('') || '<p class="board__none">Nothing here</p>'}</div></section>`; }).join('')}</div>`;
      table = null;
    } else {
      table = dataTable(body, {
        rows: data, sort: 'date', dir: 'desc', pageSize: 10, placeholder: 'Search name, phone, message…',
        searchText: (e) => `${e.name} ${e.phone} ${e.message} ${productName(e)} ${e.topic}`,
        filters: [{ key: 'status', label: 'All statuses', options: STAGES.map((s) => [s, s[0].toUpperCase() + s.slice(1)]), test: (e, v) => e.status === v },
          { key: 'source', label: 'All sources', options: Object.entries(SOURCES), test: (e, v) => e.source === v }],
        exportName: 'enquiries', exportRow: { head: ['Date', 'Name', 'Phone', 'Source', 'Topic', 'Product', 'Status', 'Message'], row: (e) => [e.createdAt, e.name, e.phone, SOURCES[e.source] ?? e.source, e.topic, productName(e), e.status, e.message] },
        onRow: (e) => openEnquiry(e.id),
        empty: 'No enquiries yet', emptyAction: '<button class="btn btn--primary btn--sm" type="button" data-log>Log the first enquiry</button>',
        columns: [
          { key: 'name', label: 'Customer', sort: (e) => e.name.toLowerCase(), render: (e) => `<div class="cell">${avatar(e.name)}<span><strong>${esc(e.name)}</strong><small>${esc(e.phone || 'No phone yet')}</small></span></div>` },
          { key: 'topic', label: 'Interested in', render: (e) => `<div class="cell"><span><strong>${esc(productName(e) || e.topic)}</strong><small>${esc(e.message ? e.message.slice(0, 60) : e.topic)}</small></span></div>` },
          { key: 'source', label: 'Source', sort: (e) => e.source, render: (e) => esc(SOURCES[e.source] ?? e.source) },
          { key: 'status', label: 'Status', sort: (e) => STAGES.indexOf(e.status), render: (e) => pill(e.status) },
          { key: 'date', label: 'Received', sort: (e) => e.createdAt, render: (e) => timeAgo(e.createdAt) },
        ],
      });
    }
  };

  const card = (e) => `<button type="button" class="bcard" data-open="${e.id}"><strong>${esc(e.name)}</strong><span>${esc(productName(e) || e.topic)}</span><small>${esc(SOURCES[e.source] ?? e.source)} · ${timeAgo(e.createdAt)}</small></button>`;

  function openEnquiry(id) {
    const e = db.get('enquiries', id);
    if (!e) return toast('That enquiry no longer exists.', { tone: 'error' });
    const p = e.productId ? db.get('products', e.productId) : null;
    const wa = digits(e.phone);
    const d = drawer({
      title: e.name, subtitle: `${esc(SOURCES[e.source] ?? e.source)} · ${fmtDateTime(e.createdAt)}`,
      body: `
        <ol class="stepper" aria-label="Pipeline stage">${STAGES.filter((s) => s !== 'lost').map((s) => `<li><button type="button" data-stage="${s}" class="${e.status === s ? 'is-on' : STAGES.indexOf(s) < STAGES.indexOf(e.status) && e.status !== 'lost' ? 'is-done' : ''}" ${e.status === 'won' && s !== 'won' ? '' : ''}>${s[0].toUpperCase() + s.slice(1)}</button></li>`).join('')}</ol>
        ${e.status === 'lost' ? `<p class="callout callout--red">${icon('alert', { size: 18 })} Marked as lost. Move it back to any stage to reopen.</p>` : ''}
        <div class="kv">
          <div><span>Phone</span><b>${e.phone ? esc(e.phone) : '<em>Not captured. Ask on WhatsApp.</em>'}</b></div>
          <div><span>Topic</span><b>${esc(e.topic)}</b></div>
          ${p ? `<div><span>Product</span><b>${esc(p.name)}</b></div>` : ''}
          ${e.message ? `<div class="kv__full"><span>Message</span><b>${esc(e.message)}</b></div>` : ''}
        </div>
        <div class="row-actions">
          ${e.phone ? `<a class="btn btn--ghost btn--sm" href="tel:${wa}">${icon('phone', { size: 16 })} Call</a><a class="btn btn--whatsapp btn--sm" href="https://wa.me/${wa.length === 10 ? '91' + wa : wa}" target="_blank" rel="noopener">${icon('whatsapp', { size: 16 })} WhatsApp</a>` : ''}
        </div>
        <form id="enq-note" class="stack">${textArea('Internal notes', 'notes', e.notes, { rows: 4, placeholder: 'What was discussed? What happens next?' })}
          <div class="row2">${field('Name', 'name', { value: e.name, required: true })}${field('Phone', 'phone', { value: e.phone, type: 'tel' })}</div></form>`,
      footer: `${e.orderId ? `<a class="btn btn--ghost" href="#/orders/${e.orderId}" data-close>View order</a>` : `<button class="btn btn--ghost" type="button" id="convert">${icon('receipt', { size: 16 })} Create quote</button>`}
        ${e.status === 'lost' ? '' : '<button class="btn btn--danger" type="button" id="lost">Mark lost</button>'}<button class="btn btn--primary" type="submit" form="enq-note">Save</button>`,
      onMount: ({ el: box, close }) => {
        $('#enq-note', box).addEventListener('submit', (ev) => {
          ev.preventDefault();
          if (!validate(ev.target)) return;
          db.put('enquiries', { id, ...formData(ev.target) });
          toast('Enquiry saved'); close();
        });
        box.addEventListener('click', (ev) => {
          const st = ev.target.closest('[data-stage]');
          if (st) { db.setEnquiryStatus(id, st.dataset.stage); toast(`Moved to ${st.dataset.stage}`); close(); }
        });
        $('#lost', box)?.addEventListener('click', () => { db.setEnquiryStatus(id, 'lost'); toast('Marked as lost', { undo: () => db.setEnquiryStatus(id, e.status) }); close(); });
        $('#convert', box)?.addEventListener('click', () => { close(); go(`orders?new=1&enquiry=${id}`); });
      },
    });
    return d;
  }

  function logEnquiry() {
    modal({
      title: 'Log an enquiry', subtitle: 'For calls, walk-ins and WhatsApp chats that did not come through the website.',
      body: `<form id="log-form" class="stack" novalidate>${field('Name', 'name', { required: true })}${field('Phone', 'phone', { type: 'tel', required: true })}
        <div class="row2">${selectField('Source', 'source', [['phone', 'Phone call'], ['walk-in', 'Walk-in'], ['whatsapp', 'WhatsApp']])}${selectField('Topic', 'topic', TOPICS.map((t) => [t, t]))}</div>
        ${selectField('Product (optional)', 'productId', [['', 'None'], ...db.allProducts().map((p) => [p.id, p.name])])}${textArea('Message', 'message', '', { rows: 3 })}</form>`,
      footer: '<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit" form="log-form">Save enquiry</button>',
      onMount: ({ el: box, close }) => $('#log-form', box).addEventListener('submit', (ev) => {
        ev.preventDefault();
        if (!validate(ev.target)) return;
        const rec = db.addEnquiry(formData(ev.target));
        close(); toast('Enquiry logged'); if (rec) setTimeout(() => openEnquiry(rec.id), 250);
      }),
    });
  }

  el.addEventListener('click', (ev) => {
    const m = ev.target.closest('[data-mode]');
    if (m) { mode = m.dataset.mode; sessionStorage.setItem('enq.mode', mode); draw(); return; }
    if (ev.target.closest('#log, [data-log]')) logEnquiry();
    const o = ev.target.closest('[data-open]');
    if (o) openEnquiry(o.dataset.open);
  });

  draw();
  if (query.new) logEnquiry();
  else if (query.open) openEnquiry(query.open);
  onCleanup(db.subscribe(() => (table ? table.refresh(rows()) : draw())));
  void $$;
}
