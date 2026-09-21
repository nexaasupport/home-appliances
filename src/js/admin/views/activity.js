import { db } from '../../store.js';
import { $, dataTable, esc, fmtDateTime, icon, pageHead, timeAgo } from '../ui.js';

const ICONS = { order: 'receipt', enquiry: 'headset', product: 'box', stock: 'truck', service: 'tool', customer: 'users', settings: 'wrench', auth: 'lock' };

export default function render({ el, onCleanup }) {
  el.innerHTML = `${pageHead({ title: 'Activity log', sub: 'Who did what, newest first. The last 300 actions are kept.' })}<div id="tbl"></div>`;
  const table = dataTable($('#tbl', el), {
    rows: db.all('activity'), pageSize: 15, placeholder: 'Search activity…', searchText: (a) => `${a.text} ${a.by} ${a.type}`,
    filters: [{ key: 't', label: 'All types', options: Object.keys(ICONS).map((k) => [k, k[0].toUpperCase() + k.slice(1)]), test: (a, v) => a.type === v }],
    exportName: 'activity', exportRow: { head: ['When', 'Who', 'Type', 'What'], row: (a) => [a.at, a.by, a.type, a.text] }, empty: 'Nothing logged yet',
    columns: [
      { key: 'text', label: 'Action', render: (a) => `<div class="cell"><span class="pop__ico">${icon(ICONS[a.type] ?? 'clock', { size: 18 })}</span><span><strong>${esc(a.text)}</strong></span></div>` },
      { key: 'by', label: 'By', render: (a) => esc(a.by) },
      { key: 'at', label: 'When', render: (a) => `<span title="${fmtDateTime(a.at)}">${timeAgo(a.at)}</span>` },
    ],
  });
  onCleanup(db.subscribe(() => table.refresh(db.all('activity'))));
}
