import { categories } from '../../../data/catalog.js';
import { db } from '../../store.js';
import { photo } from '../../utils/format.js';
import { $, $$, confirmDialog, dataTable, drawer, esc, field, formData, icon, inr, pageHead, pill, selectField, textArea, toast, validate } from '../ui.js';

const catName = (id) => categories.find((c) => c.id === id)?.name ?? id;
const thumbSrc = (p) => p.image || (p.photo ? photo(p.photo, 96, 96) : '');
const thumb = (p) => (thumbSrc(p) ? `<img class="thumb" src="${thumbSrc(p)}" alt="" loading="lazy" width="44" height="44">` : `<span class="thumb glyph">${icon('box', { size: 20 })}</span>`);

/** Resize and compress an uploaded photo so localStorage stays small (~150 KB target). */
function compress(file, max = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let q = 0.82, out = c.toDataURL('image/webp', q);
      while (out.length > 200_000 && q > 0.4) { q -= 0.1; out = c.toDataURL('image/webp', q); }
      resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not a readable image.')); };
    img.src = url;
  });
}

export default function render({ el, query, onCleanup, can }) {
  const owner = can('delete');
  const rows = () => db.allProducts();
  let table;

  const setStatus = (list, status) => { list.forEach((p) => db.put('products', { id: p.id, status })); db.log('product', `${list.length} product(s) ${status === 'hidden' ? 'hidden from' : 'shown on'} the website`); toast(`${list.length} product${list.length > 1 ? 's' : ''} ${status === 'hidden' ? 'hidden' : 'now visible'}`); };
  const remove = async (list) => {
    if (!owner) return toast('Only the owner can delete products.', { tone: 'error' });
    const ok = await confirmDialog({ title: `Delete ${list.length > 1 ? `${list.length} products` : list[0].name}?`, text: 'They disappear from the website and stock lists. Existing orders keep their history. You can undo right after.', confirm: 'Delete', danger: true });
    if (!ok) return;
    const gone = list.map((p) => db.del('products', p.id)).filter(Boolean);
    db.log('product', `Deleted ${gone.map((p) => p.name).join(', ')}`);
    toast(`${gone.length} deleted`, { undo: () => gone.forEach((p) => db.restore('products', p)) });
  };

  el.innerHTML = `${pageHead({ title: 'Products', sub: 'Everything on your website. Hidden products stay here but disappear from the store.', actions: `<button class="btn btn--primary btn--sm" type="button" id="add">${icon('plus', { size: 16 })} Add product</button>` })}<div id="tbl"></div>`;
  table = dataTable($('#tbl', el), {
    rows: rows(), sort: 'name', dir: 'asc', pageSize: 10, placeholder: 'Search name, brand, SKU…',
    searchText: (p) => `${p.name} ${p.brand} ${p.sku} ${catName(p.category)}`,
    filters: [
      { key: 'cat', label: 'All categories', options: categories.map((c) => [c.id, c.name]), test: (p, v) => p.category === v },
      { key: 'vis', label: 'All visibility', options: [['active', 'Visible'], ['hidden', 'Hidden']], test: (p, v) => (p.status ?? 'active') === v },
      { key: 'stock', label: 'All stock', options: [['in', 'In stock'], ['low', 'Low stock'], ['out', 'Out of stock']], test: (p, v) => db.status(p) === v },
    ],
    exportName: 'products', exportRow: { head: ['SKU', 'Name', 'Brand', 'Category', 'Price', 'Cost', 'Stock', 'Visibility'], row: (p) => [p.sku, p.name, p.brand, catName(p.category), p.price, p.cost, p.stock, p.status ?? 'active'] },
    bulk: [{ label: 'Hide from website', run: (l) => setStatus(l, 'hidden') }, { label: 'Show on website', run: (l) => setStatus(l, 'active') }, ...(owner ? [{ label: 'Delete', run: remove }] : [])],
    onRow: (p) => edit(p.id),
    empty: 'No products yet', emptyAction: '<button class="btn btn--primary btn--sm" type="button" data-add>Add your first product</button>',
    columns: [
      { key: 'name', label: 'Product', sort: (p) => p.name.toLowerCase(), render: (p) => `<div class="cell">${thumb(p)}<span><strong>${esc(p.name)}</strong><small>${esc(p.brand)} · ${esc(p.sku ?? '')}</small></span></div>` },
      { key: 'category', label: 'Category', sort: (p) => catName(p.category), render: (p) => esc(catName(p.category)) },
      { key: 'price', label: 'Price', align: 'right', sort: (p) => p.price, render: (p) => inr(p.price) },
      { key: 'stock', label: 'Stock', align: 'right', sort: (p) => p.stock, render: (p) => `${p.stock} ${pill(db.status(p))}` },
      { key: 'vis', label: 'Website', sort: (p) => p.status ?? 'active', render: (p) => pill(p.status ?? 'active') },
    ],
  });

  function edit(id) {
    const p = id ? db.allProducts().find((x) => x.id === id) : null;
    const draft = { image: p?.image ?? '', specs: Object.entries(p?.specs ?? {}) };
    const d = drawer({
      title: p ? p.name : 'Add product', subtitle: p ? `${esc(p.sku ?? '')} · ${esc(catName(p.category))}` : 'Fill in the basics, then add a photo and specs.', wide: true,
      body: `
        <div class="tabs" role="tablist">${['Basics', 'Pricing & stock', 'Photo', 'Specs'].map((t, i) => `<button type="button" role="tab" data-tab="${i}" aria-selected="${i === 0}">${t}</button>`).join('')}</div>
        <form id="pform" class="pform" novalidate>
          <section data-panel="0" class="stack">${field('Product name', 'name', { value: p?.name, required: true })}
            <div class="row2">${field('Brand', 'brand', { value: p?.brand, required: true })}${selectField('Category', 'category', categories.map((c) => [c.id, c.name]), p?.category ?? categories[0].id)}</div>
            ${textArea('Description', 'description', p?.description ?? '', { rows: 4 })}
            <label class="switch"><input type="checkbox" name="visible" ${(p?.status ?? 'active') === 'active' ? 'checked' : ''}><span></span> Visible on the website</label></section>
          <section data-panel="1" class="stack" hidden>
            <div class="row2">${field('Selling price (₹)', 'price', { type: 'number', value: p?.price ?? '', required: true, attrs: 'min="1" inputmode="numeric"' })}${field('Your cost (₹)', 'cost', { type: 'number', value: p?.cost ?? '', attrs: 'min="0" inputmode="numeric"', hint: 'Used for profit reports. Owner only.' })}</div>
            <div class="row2">${field('Stock on hand', 'stock', { type: 'number', value: p?.stock ?? 0, required: true, attrs: 'min="0" inputmode="numeric"' })}${field('SKU', 'sku', { value: p?.sku ?? '' })}</div>
            <label class="switch"><input type="checkbox" name="featured" ${p?.featured ? 'checked' : ''}><span></span> Feature on the home page</label></section>
          <section data-panel="2" class="stack" hidden>
            <div class="media-box" id="media-box"></div>
            <label class="btn btn--ghost btn--sm media-up">${icon('plus', { size: 16 })} Upload photo<input type="file" accept="image/*" id="up" hidden></label>
            <p class="hint">Photos are resized to WebP under about 150 KB and stored in this browser. Without an upload, the catalogue photo is used.</p></section>
          <section data-panel="3" class="stack" hidden><div id="specs" class="stack"></div><button class="btn btn--ghost btn--sm" type="button" id="add-spec">${icon('plus', { size: 16 })} Add spec</button></section>
        </form>`,
      footer: `${p && owner ? '<button class="btn btn--danger" type="button" id="del">Delete</button>' : ''}<button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn btn--primary" type="submit" form="pform">${p ? 'Save changes' : 'Add product'}</button>`,
      onMount: ({ el: box, close }) => {
        const form = $('#pform', box);
        const tab = (i) => { $$('[data-tab]', box).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === String(i)))); $$('[data-panel]', box).forEach((s) => (s.hidden = s.dataset.panel !== String(i))); };
        box.addEventListener('click', (e) => { const t = e.target.closest('[data-tab]'); if (t) tab(t.dataset.tab); });
        const drawMedia = () => {
          const src = draft.image || (p?.photo ? photo(p.photo, 600, 450) : '');
          $('#media-box', box).innerHTML = src ? `<img src="${src}" alt="Product photo preview"><button type="button" class="btn btn--danger btn--sm" id="rm-img" ${draft.image ? '' : 'hidden'}>Remove upload</button>` : `<div class="empty-mini">${icon('box', { size: 28 })}<p>No photo yet</p></div>`;
        };
        const drawSpecs = () => {
          $('#specs', box).innerHTML = draft.specs.map(([k, v], i) => `<div class="spec-row"><input class="input" aria-label="Spec name" data-k="${i}" value="${esc(k)}" placeholder="Name"><input class="input" aria-label="Spec value" data-v="${i}" value="${esc(v)}" placeholder="Value"><button class="icon-btn" type="button" data-rm="${i}" aria-label="Remove spec">${icon('close', { size: 18 })}</button></div>`).join('') || '<p class="hint">No specs yet.</p>';
        };
        drawMedia(); drawSpecs();
        $('#add-spec', box).addEventListener('click', () => { draft.specs.push(['', '']); drawSpecs(); $$('[data-k]', box).at(-1).focus(); });
        $('#specs', box).addEventListener('input', (e) => { if (e.target.dataset.k) draft.specs[e.target.dataset.k][0] = e.target.value; if (e.target.dataset.v) draft.specs[e.target.dataset.v][1] = e.target.value; });
        $('#specs', box).addEventListener('click', (e) => { const r = e.target.closest('[data-rm]'); if (r) { draft.specs.splice(Number(r.dataset.rm), 1); drawSpecs(); } });
        $('#media-box', box).addEventListener('click', (e) => { if (e.target.closest('#rm-img')) { draft.image = ''; drawMedia(); } });
        $('#up', box).addEventListener('change', async (e) => {
          const f = e.target.files[0]; if (!f) return;
          try { draft.image = await compress(f); drawMedia(); toast(`Photo ready (${Math.round(draft.image.length / 1024)} KB)`); } catch (err) { toast(err.message, { tone: 'error' }); }
        });
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (!validate(form, { price: (v) => (Number(v) > 0 ? '' : 'Enter a price above zero.'), stock: (v) => (Number(v) >= 0 ? '' : 'Stock cannot be negative.') })) { tab(Number($('[aria-invalid="true"]', form)?.closest('[data-panel]')?.dataset.panel ?? 0)); return; }
          const f = formData(form);
          const specs = Object.fromEntries(draft.specs.filter(([k, v]) => k.trim() && v.trim()).map(([k, v]) => [k.trim(), v.trim()]));
          const rec = { name: f.name.trim(), brand: f.brand.trim(), category: f.category, description: f.description, price: Number(f.price), cost: Number(f.cost) || 0, sku: f.sku || `NX-${Date.now().toString(36).toUpperCase()}`, status: f.visible ? 'active' : 'hidden', featured: Boolean(f.featured), specs, image: draft.image };
          const newStock = Number(f.stock);
          if (p) {
            db.put('products', { id: p.id, ...rec });
            if (newStock !== p.stock) db.adjustStock(p.id, newStock - p.stock, 'Manual edit', p.id);
            db.log('product', `Updated ${rec.name}`, p.id);
            toast('Product saved');
          } else {
            const row = db.put('products', { ...rec, stock: 0, rating: 4.5 });
            if (newStock) db.adjustStock(row.id, newStock, 'Opening stock', row.id);
            db.log('product', `Added ${rec.name}`, row.id);
            toast('Product added');
          }
          close();
        });
        $('#del', box)?.addEventListener('click', () => { close(); setTimeout(() => remove([p]), 260); });
      },
    });
    return d;
  }

  el.addEventListener('click', (e) => { if (e.target.closest('#add, [data-add]')) edit(null); });
  if (query.new) edit(null); else if (query.open) edit(query.open);
  onCleanup(db.subscribe(() => table.refresh(rows())));
}
