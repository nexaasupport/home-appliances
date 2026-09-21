import { icon } from '../utils/icons.js';
import { inr } from '../utils/format.js';

export { icon, inr };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const today = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => (iso ? new Date(iso).toLocaleDateString('en-IN', opts) : '—');
export const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');
export function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return fmtDate(iso);
}

// ---------- status pills (colour + label + dot, never colour alone) ----------
export const TONES = {
  new: 'blue', contacted: 'amber', quoted: 'violet', won: 'green', lost: 'red',
  quote: 'violet', confirmed: 'blue', delivered: 'amber', completed: 'green', cancelled: 'red',
  unpaid: 'red', partial: 'amber', paid: 'green',
  open: 'red', scheduled: 'blue', inprogress: 'amber', done: 'green',
  in: 'green', low: 'amber', out: 'red', active: 'green', hidden: 'gray',
  ordered: 'amber', received: 'green', owner: 'violet', staff: 'blue',
};
export const LABELS = { in: 'In stock', low: 'Low stock', out: 'Out of stock', inprogress: 'In progress', unpaid: 'Unpaid', partial: 'Part paid', paid: 'Paid' };
export const pill = (status) => `<span class="pill pill--${TONES[status] ?? 'gray'}"><i></i>${esc(LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1))}</span>`;
export const initials = (name) => String(name ?? '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
export const avatar = (name, cls = '') => `<span class="avatar ${cls}" aria-hidden="true">${esc(initials(name))}</span>`;

// ---------- toast with optional Undo ----------
export function toast(message, { undo, tone = 'ok', ms = 5000 } = {}) {
  let host = $('.a-toasts');
  if (!host) { host = document.createElement('div'); host.className = 'a-toasts'; host.setAttribute('aria-live', 'polite'); document.body.append(host); }
  const el = document.createElement('div');
  el.className = `a-toast a-toast--${tone}`;
  el.innerHTML = `${icon(tone === 'error' ? 'alert' : 'check', { size: 18 })}<span>${esc(message)}</span>${undo ? '<button type="button" class="a-toast__undo">Undo</button>' : ''}`;
  host.append(el);
  const drop = () => { el.classList.add('is-out'); setTimeout(() => el.remove(), 220); };
  el.querySelector('.a-toast__undo')?.addEventListener('click', () => { undo(); drop(); });
  setTimeout(drop, ms);
}

// ---------- overlays: modal, drawer, confirm (focus trap + Esc + restore focus) ----------
function overlay(kind, { title, subtitle = '', body, footer = '', wide = false, onMount }) {
  const prev = document.activeElement;
  const wrap = document.createElement('div');
  wrap.className = `ov ov--${kind}`;
  wrap.innerHTML = `
    <div class="ov__scrim" data-close></div>
    <section class="ov__panel${wide ? ' ov__panel--wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="ov-title">
      <header class="ov__head"><div><h2 id="ov-title">${esc(title)}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div><button class="icon-btn" type="button" data-close aria-label="Close">${icon('close', { size: 20 })}</button></header>
      <div class="ov__body">${body}</div>
      ${footer ? `<footer class="ov__foot">${footer}</footer>` : ''}
    </section>`;
  document.body.append(wrap);
  document.body.classList.add('no-scroll');
  const close = () => {
    document.removeEventListener('keydown', onKey);
    wrap.classList.add('is-out');
    setTimeout(() => { wrap.remove(); if (!$('.ov')) document.body.classList.remove('no-scroll'); prev?.focus?.(); }, 240);
  };
  const focusable = () => $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])', wrap).filter((e) => e.offsetParent !== null);
  const onKey = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    if (e.key === 'Tab') {
      const f = focusable(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', onKey);
  wrap.addEventListener('click', (e) => e.target.closest('[data-close]') && close());
  requestAnimationFrame(() => { wrap.classList.add('is-in'); (wrap.querySelector('[autofocus],input,select,textarea') ?? wrap.querySelector('.ov__head .icon-btn')).focus({ preventScroll: true }); });
  const api = { el: wrap, close, panel: wrap.querySelector('.ov__panel') };
  onMount?.(api);
  return api;
}
export const modal = (o) => overlay('modal', o);
export const drawer = (o) => overlay('drawer', o);

export function confirmDialog({ title, text, confirm = 'Confirm', danger = false }) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };
    const m = overlay('modal', {
      title, body: `<p class="ov__text">${text}</p>`,
      footer: `<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn ${danger ? 'btn--danger-solid' : 'btn--primary'}" type="button" id="cf-ok">${esc(confirm)}</button>`,
      onMount: (api) => { api.el.querySelector('#cf-ok').addEventListener('click', () => { done(true); api.close(); }); api.el.addEventListener('click', (e) => e.target.closest('[data-close]') && done(false)); },
    });
    new MutationObserver(() => { if (!document.body.contains(m.el)) done(false); }).observe(document.body, { childList: true });
  });
}

// ---------- form helpers ----------
export const field = (label, name, { type = 'text', value = '', required = false, attrs = '', hint = '' } = {}) =>
  `<div class="field"><label for="f-${name}">${label}${required ? ' <span aria-hidden="true">*</span>' : ''}</label><input class="input" id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${required ? 'required' : ''} ${attrs}>${hint ? `<span class="hint">${hint}</span>` : ''}<span class="error" data-for="${name}"></span></div>`;
export const selectField = (label, name, options, value = '', { required = false } = {}) =>
  `<div class="field"><label for="f-${name}">${label}</label><select class="input" id="f-${name}" name="${name}" ${required ? 'required' : ''}>${options.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
export const textArea = (label, name, value = '', { rows = 4, placeholder = '' } = {}) =>
  `<div class="field"><label for="f-${name}">${label}</label><textarea class="input" id="f-${name}" name="${name}" rows="${rows}" placeholder="${esc(placeholder)}">${esc(value)}</textarea></div>`;

/** Validates required fields inside a form; shows inline errors and focuses the first bad one. */
export function validate(form, extra = {}) {
  let first = null;
  $$('[required]', form).forEach((el) => {
    const msg = !String(el.value).trim() ? 'This field is required.' : extra[el.name]?.(el.value) ?? '';
    el.setAttribute('aria-invalid', String(Boolean(msg)));
    const slot = $(`[data-for="${el.name}"]`, form);
    if (slot) slot.textContent = msg;
    if (msg && !first) first = el;
  });
  first?.focus();
  return !first;
}
export const formData = (form) => Object.fromEntries(new FormData(form));

// ---------- CSV ----------
export function downloadCSV(name, rows) {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(cell).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `${name}-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------- data table: search, filters, sort, pagination, selection, CSV ----------
export function dataTable(mount, opts) {
  const { columns, searchText = () => '', filters = [], pageSize = 10, rowId = (r) => r.id, onRow, empty = 'Nothing to show yet.', emptyAction = '', exportName, exportRow, bulk = [], placeholder = 'Search…', toolbarExtra = '' } = opts;
  let rows = opts.rows;
  const st = { q: '', sort: opts.sort ?? null, dir: opts.dir ?? 'desc', page: 1, sel: new Set(), f: Object.fromEntries(filters.map((f) => [f.key, ''])) };

  mount.innerHTML = `
    <div class="dt">
      <div class="dt__bar">
        <label class="dt__search">${icon('search', { size: 18 })}<span class="sr">Search</span><input type="search" placeholder="${esc(placeholder)}" autocomplete="off"></label>
        ${filters.map((f) => `<label class="dt__filter"><span class="sr">${esc(f.label)}</span><select class="input" data-f="${f.key}"><option value="">${esc(f.label)}</option>${f.options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select></label>`).join('')}
        ${toolbarExtra}
        ${exportName ? `<button class="btn btn--ghost btn--sm" type="button" data-export>${icon('receipt', { size: 16 })} Export CSV</button>` : ''}
      </div>
      <div class="dt__bulk" hidden><strong></strong>${bulk.map((b, i) => `<button class="btn btn--ghost btn--sm" type="button" data-bulk="${i}">${esc(b.label)}</button>`).join('')}<button class="link-detail" type="button" data-clear>Clear</button></div>
      <div class="dt__wrap"></div>
      <div class="dt__foot"></div>
    </div>`;
  const wrap = $('.dt__wrap', mount), foot = $('.dt__foot', mount), bulkBar = $('.dt__bulk', mount);

  const view = () => {
    let out = rows.filter((r) => (!st.q || searchText(r).toLowerCase().includes(st.q.toLowerCase())) && filters.every((f) => !st.f[f.key] || f.test(r, st.f[f.key])));
    const col = columns.find((c) => c.key === st.sort);
    if (col) out = [...out].sort((a, b) => { const x = col.sort(a), y = col.sort(b); return (x > y ? 1 : x < y ? -1 : 0) * (st.dir === 'asc' ? 1 : -1); });
    return out;
  };

  const paint = () => {
    const all = view();
    const pages = Math.max(1, Math.ceil(all.length / pageSize));
    st.page = Math.min(st.page, pages);
    const slice = all.slice((st.page - 1) * pageSize, st.page * pageSize);
    const selectable = bulk.length > 0;
    wrap.innerHTML = all.length ? `
      <div class="table-wrap"><table class="table table--stack">
        <thead><tr>${selectable ? `<th class="dt__chk"><input type="checkbox" aria-label="Select all on this page" data-all></th>` : ''}${columns.map((c) => `<th scope="col" class="${c.align === 'right' ? 'num' : ''}" ${c.sort && st.sort === c.key ? `aria-sort="${st.dir === 'asc' ? 'ascending' : 'descending'}"` : ''}>${c.sort ? `<button type="button" class="dt__sort" data-sort="${c.key}">${c.label}<span aria-hidden="true">${st.sort === c.key ? (st.dir === 'asc' ? '↑' : '↓') : '↕'}</span></button>` : c.label}</th>`).join('')}</tr></thead>
        <tbody>${slice.map((r) => `<tr data-id="${esc(rowId(r))}" class="${onRow ? 'is-click' : ''}${st.sel.has(rowId(r)) ? ' is-sel' : ''}">${selectable ? `<td class="dt__chk"><input type="checkbox" data-sel="${esc(rowId(r))}" ${st.sel.has(rowId(r)) ? 'checked' : ''} aria-label="Select row"></td>` : ''}${columns.map((c) => `<td class="${c.align === 'right' ? 'num' : ''}" data-label="${esc(c.label)}">${c.render(r)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>` : `<div class="empty-state"><span class="empty-state__icon">${icon('search', { size: 28 })}</span><h3>${st.q || Object.values(st.f).some(Boolean) ? 'No results match your filters' : esc(empty)}</h3><p>${st.q || Object.values(st.f).some(Boolean) ? 'Try a different search or clear the filters.' : ''}</p>${st.q || Object.values(st.f).some(Boolean) ? '<button class="btn btn--ghost btn--sm" type="button" data-reset>Clear filters</button>' : emptyAction}</div>`;
    foot.innerHTML = all.length ? `<span>Showing ${(st.page - 1) * pageSize + 1}–${Math.min(st.page * pageSize, all.length)} of ${all.length}</span>${pages > 1 ? `<div class="dt__pager"><button type="button" class="btn btn--ghost btn--sm" data-page="-1" ${st.page === 1 ? 'disabled' : ''}>Previous</button><span>Page ${st.page} of ${pages}</span><button type="button" class="btn btn--ghost btn--sm" data-page="1" ${st.page === pages ? 'disabled' : ''}>Next</button></div>` : ''}` : '';
    bulkBar.hidden = !st.sel.size;
    bulkBar.querySelector('strong').textContent = `${st.sel.size} selected`;
    const allBox = $('[data-all]', wrap);
    if (allBox) allBox.checked = slice.length > 0 && slice.every((r) => st.sel.has(rowId(r)));
  };

  mount.addEventListener('input', (e) => { if (e.target.matches('.dt__search input')) { st.q = e.target.value; st.page = 1; paint(); } });
  mount.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-f]')) { st.f[t.dataset.f] = t.value; st.page = 1; paint(); }
    if (t.matches('[data-sel]')) { t.checked ? st.sel.add(t.dataset.sel) : st.sel.delete(t.dataset.sel); paint(); }
    if (t.matches('[data-all]')) { view().slice((st.page - 1) * pageSize, st.page * pageSize).forEach((r) => (t.checked ? st.sel.add(rowId(r)) : st.sel.delete(rowId(r)))); paint(); }
  });
  mount.addEventListener('click', (e) => {
    const t = e.target;
    const sortBtn = t.closest('[data-sort]');
    if (sortBtn) { const k = sortBtn.dataset.sort; st.dir = st.sort === k && st.dir === 'desc' ? 'asc' : 'desc'; st.sort = k; paint(); return; }
    const pg = t.closest('[data-page]');
    if (pg) { st.page += Number(pg.dataset.page); paint(); return; }
    if (t.closest('[data-reset]')) { st.q = ''; Object.keys(st.f).forEach((k) => (st.f[k] = '')); $('.dt__search input', mount).value = ''; $$('[data-f]', mount).forEach((s) => (s.value = '')); paint(); return; }
    if (t.closest('[data-clear]')) { st.sel.clear(); paint(); return; }
    const bk = t.closest('[data-bulk]');
    if (bk) { bulk[Number(bk.dataset.bulk)].run(rows.filter((r) => st.sel.has(rowId(r)))); st.sel.clear(); return; }
    if (t.closest('[data-export]')) { downloadCSV(exportName, [exportRow.head, ...view().map(exportRow.row)]); return; }
    const tr = t.closest('tbody tr');
    if (tr && onRow && !t.closest('input,button,a,select')) onRow(rows.find((r) => String(rowId(r)) === tr.dataset.id));
  });

  paint();
  return { refresh(next) { rows = next; st.sel.clear(); paint(); }, state: st };
}

// ---------- tiny SVG charts ----------
export function sparkline(values, { w = 120, h = 36, stroke = 'currentColor' } = {}) {
  const max = Math.max(1, ...values), min = Math.min(0, ...values);
  const step = w / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 4 - ((v - min) / (max - min || 1)) * (h - 8)).toFixed(1)}`);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts.join(' ')}"/></svg>`;
}
export function barChart(data, { h = 200, label = 'Chart' } = {}) {
  const w = Math.max(320, data.length * 44 + 40);
  const max = Math.max(1, ...data.map((d) => d.value));
  return `<svg class="chart" viewBox="0 0 ${w} ${h + 30}" role="img" aria-label="${esc(label)}">
    ${[0.25, 0.5, 0.75, 1].map((g) => `<line x1="8" x2="${w - 8}" y1="${h - h * g}" y2="${h - h * g}" class="grid"/>`).join('')}
    ${data.map((d, i) => { const bh = Math.max(d.value ? 3 : 0, (d.value / max) * (h - 8)); const x = 16 + i * ((w - 32) / data.length); const bw = Math.min(28, (w - 32) / data.length - 8); return `<g><rect class="bar" x="${x}" y="${h - bh}" width="${bw}" height="${bh}" rx="6" style="--d:${i * 30}ms"><title>${esc(d.label)}: ${inr(d.value)}</title></rect><text x="${x + bw / 2}" y="${h + 18}" text-anchor="middle">${esc(d.label)}</text></g>`; }).join('')}
  </svg>`;
}
export function donut(parts, { size = 160 } = {}) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const r = 60, c = 2 * Math.PI * r;
  let off = 0;
  return `<svg class="donut" viewBox="0 0 160 160" width="${size}" height="${size}" role="img" aria-label="Share by category">
    <circle cx="80" cy="80" r="${r}" fill="none" stroke="#eaf0fa" stroke-width="22"/>
    ${parts.map((p) => { const len = (p.value / total) * c; const el = `<circle cx="80" cy="80" r="${r}" fill="none" stroke="${p.color}" stroke-width="22" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-off}" transform="rotate(-90 80 80)"><title>${esc(p.label)}: ${Math.round((p.value / total) * 100)}%</title></circle>`; off += len; return el; }).join('')}
  </svg>`;
}

export const pageHead = ({ title, sub = '', actions = '' }) =>
  `<div class="pagehead"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="pagehead__actions">${actions}</div></div>`;

/** Navigate inside the admin (hash router). */
export const go = (path) => { location.hash = `#/${path}`; };
