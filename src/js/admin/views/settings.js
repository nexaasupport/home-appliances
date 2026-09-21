import { db } from '../../store.js';
import { sha256 } from '../auth.js';
import { $, confirmDialog, esc, field, formData, icon, modal, pageHead, pill, selectField, textArea, today, toast, validate } from '../ui.js';

export default function render({ el, user, onCleanup }) {
  const paint = () => {
    const s = db.settings();
    el.innerHTML = `${pageHead({ title: 'Settings', sub: 'Store details, invoices, team and backups.' })}
    <div class="settings">
      <form class="card card--pad stack" id="sform-store" novalidate><div class="card__head"><h2>Store profile</h2></div>
        <div class="row2">${field('Store name', 'name', { value: s.name, required: true })}${field('Tagline', 'tagline', { value: s.tagline })}</div>
        <div class="row2">${field('Phone', 'phone', { value: s.phone, type: 'tel', required: true })}${field('WhatsApp number', 'whatsapp', { value: s.whatsapp, hint: 'Digits with country code, e.g. 919876543210', required: true })}</div>
        <div class="row2">${field('Email', 'email', { value: s.email, type: 'email' })}${field('Opening hours', 'hours', { value: s.hours })}</div>${textArea('Address', 'address', s.address, { rows: 2 })}
        <div><button class="btn btn--primary" type="submit">Save store profile</button></div></form>
      <form class="card card--pad stack" id="sform-inv" novalidate><div class="card__head"><h2>Invoices and stock</h2></div>
        <div class="row2">${field('Invoice prefix', 'invoicePrefix', { value: s.invoicePrefix, required: true, hint: `Next number: ${s.invoicePrefix}-${new Date().getFullYear()}-${String((s.invoiceSeq ?? 0) + 1).padStart(4, '0')}` })}${field('GSTIN (optional)', 'gstin', { value: s.gstin ?? '' })}</div>
        ${field('Low-stock threshold', 'lowStock', { type: 'number', value: s.lowStock, required: true, attrs: 'min="0"', hint: 'Products at or below this count show as low stock.' })}${textArea('Invoice footer', 'invoiceFooter', s.invoiceFooter, { rows: 2 })}
        <div><button class="btn btn--primary" type="submit">Save invoice settings</button></div></form>
      <section class="card card--pad stack"><div class="card__head"><h2>Team</h2><button class="btn btn--ghost btn--sm" id="add-user" type="button">${icon('plus', { size: 16 })} Add user</button></div>
        <ul class="plain">${db.all('users').map((u) => `<li><span class="cell"><span class="avatar">${esc(u.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase())}</span><span><strong>${esc(u.name)}${u.id === user.id ? ' (you)' : ''}</strong><small>${esc(u.email)}</small></span></span><span class="row-actions">${pill(u.role)}${u.active ? '' : pill('hidden')}<button class="btn btn--ghost btn--sm" data-user="${u.id}">Edit</button></span></li>`).join('')}</ul>
        <p class="hint">Sign-in here is demo-grade: passwords are hashed in this browser. A live shop needs a server-side login.</p></section>
      <section class="card card--pad stack"><div class="card__head"><h2>Backup and data</h2></div>
        <p class="muted">Everything lives in this browser. Export a backup before clearing browser data or switching computers.</p>
        <div class="row-actions"><button class="btn btn--ghost btn--sm" id="export" type="button">Export backup (JSON)</button><label class="btn btn--ghost btn--sm">Import backup<input type="file" id="import" accept="application/json" hidden></label><button class="btn btn--danger btn--sm" id="reset" type="button">Reset demo data</button></div></section>
    </div>`;
  };
  paint();

  const save = (id, keys, msg) => el.addEventListener('submit', (e) => {
    if (e.target.id !== id) return;
    e.preventDefault();
    if (!validate(e.target)) return;
    const f = formData(e.target);
    const patch = Object.fromEntries(keys.map((k) => [k, f[k]]));
    if ('lowStock' in patch) patch.lowStock = Number(patch.lowStock);
    db.saveSettings(patch); db.log('settings', msg); toast('Settings saved');
  });
  save('sform-store', ['name', 'tagline', 'phone', 'whatsapp', 'email', 'hours', 'address'], 'Updated store profile');
  save('sform-inv', ['invoicePrefix', 'gstin', 'lowStock', 'invoiceFooter'], 'Updated invoice settings');

  function userModal(id) {
    const u = id ? db.get('users', id) : null;
    modal({
      title: u ? `Edit ${u.name}` : 'Add user',
      body: `<form id="uform" class="stack" novalidate>${field('Name', 'name', { value: u?.name, required: true })}${field('Email', 'email', { value: u?.email, type: 'email', required: true })}
        <div class="row2">${selectField('Role', 'role', [['staff', 'Staff (no reports, settings or deletes)'], ['owner', 'Owner (full access)']], u?.role ?? 'staff')}${selectField('Status', 'active', [['1', 'Active'], ['0', 'Disabled']], u?.active === false ? '0' : '1')}</div>
        ${field(u ? 'New password (leave blank to keep)' : 'Password', 'password', { type: 'password', required: !u, attrs: 'autocomplete="new-password" minlength="6"', hint: 'At least 6 characters.' })}</form>`,
      footer: '<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit" form="uform">Save user</button>',
      onMount: ({ el: box, close }) => $('#uform', box).addEventListener('submit', async (e) => {
        e.preventDefault();
        const others = db.all('users').filter((x) => x.id !== id);
        if (!validate(e.target, { email: (v) => (others.some((x) => x.email.toLowerCase() === v.trim().toLowerCase()) ? 'That email is already used.' : ''), password: (v) => (v && v.length < 6 ? 'Use at least 6 characters.' : '') })) return;
        const f = formData(e.target), active = f.active === '1';
        if (u && (u.id === user.id) && (!active || f.role !== 'owner')) return toast('You cannot disable or demote your own account.', { tone: 'error' });
        if (u?.role === 'owner' && (!active || f.role !== 'owner') && !others.some((x) => x.role === 'owner' && x.active)) return toast('Keep at least one active owner.', { tone: 'error' });
        const rec = { name: f.name.trim(), email: f.email.trim(), role: f.role, active };
        if (f.password) { rec.salt = crypto.randomUUID().slice(0, 8); rec.hash = await sha256(rec.salt + f.password); }
        db.put('users', { ...(u ? { id } : {}), ...rec });
        db.log('settings', `${u ? 'Updated' : 'Added'} user ${rec.name}`); toast('User saved'); close(); paint();
      }),
    });
  }

  el.addEventListener('click', async (e) => {
    if (e.target.closest('#add-user')) return userModal(null);
    const u = e.target.closest('[data-user]'); if (u) return userModal(u.dataset.user);
    if (e.target.closest('#export')) {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([db.exportJSON()], { type: 'application/json' })); a.download = `nexaa-backup-${today()}.json`; a.click(); URL.revokeObjectURL(a.href); toast('Backup downloaded'); return;
    }
    if (e.target.closest('#reset')) {
      if (await confirmDialog({ title: 'Reset all demo data?', text: 'This replaces every product, order and customer with the sample data. Export a backup first if you need one. It cannot be undone.', confirm: 'Reset everything', danger: true })) { db.reset(); toast('Demo data restored'); paint(); }
    }
  });
  el.addEventListener('change', async (e) => {
    if (e.target.id !== 'import') return;
    const f = e.target.files[0]; if (!f) return;
    try {
      const text = await f.text();
      if (await confirmDialog({ title: 'Replace all data with this backup?', text: `${esc(f.name)} will overwrite everything currently in this browser.`, confirm: 'Import backup', danger: true })) { db.importJSON(text); toast('Backup imported'); paint(); }
    } catch (err) { toast(err.message || 'Could not read that file.', { tone: 'error' }); }
    e.target.value = '';
  });
  onCleanup(db.subscribe(() => { if (!document.querySelector('.ov')) paint(); }));
}
