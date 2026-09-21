import { categories } from '../../data/catalog.js';
import { db } from '../store.js';
import { icon } from '../utils/icons.js';
import { inr } from '../utils/format.js';
import { storeCard, bindFavs } from '../components/productCard.js';
import { assurance, breadcrumbs, ctaBand } from '../components/sections.js';
import { initReveal } from '../utils/motion.js';

const SORTS = { popular: 'Featured', low: 'Price: low to high', high: 'Price: high to low', rating: 'Top rated' };

export function renderProducts() {
  const all = db.products();
  const priceMax = Math.max(5000, Math.ceil(Math.max(...all.map((p) => p.price)) / 5000) * 5000);
  const brandList = [...new Set(all.map((p) => p.brand))].sort();
  const params = new URLSearchParams(location.search);
  const state = {
    category: params.get('category') || '',
    brands: (params.get('brand') || '').split(',').filter(Boolean).map((b) => b.toLowerCase()),
    q: params.get('q') || '',
    sort: SORTS[params.get('sort')] ? params.get('sort') : 'popular',
    max: Math.min(Number(params.get('max')) || priceMax, priceMax),
    stock: params.get('stock') === '1',
    view: params.get('view') === 'list' ? 'list' : 'grid',
  };

  const countBy = (fn) => all.reduce((m, p) => ((m[fn(p)] = (m[fn(p)] ?? 0) + 1), m), {});
  const catCount = countBy((p) => p.category);
  const brandCount = countBy((p) => p.brand.toLowerCase());

  document.querySelector('#main').innerHTML = `
  <section class="store-hero">
    <div class="container store-hero__inner">
      <div>
        ${breadcrumbs([['Home', '/index.html'], ['Store']], 'crumbs--hero')}
        <span class="eyebrow">Nexaa Store</span>
        <h1>Find the right appliance for your home.</h1>
        <p>Genuine products from trusted brands, with delivery, installation and warranty support.</p>
      </div>
      <form class="store-search" role="search" id="search-form">
        <label class="sr" for="q">Search products</label>
        ${icon('search', { size: 20 })}
        <input id="q" type="search" placeholder="Search refrigerators, LG, microwave…" value="${state.q.replace(/"/g, '&quot;')}" autocomplete="off">
      </form>
    </div>
  </section>

  <section class="section section--tight store">
    <div class="container">
      <div class="cattabs" role="group" aria-label="Categories">
        <button class="cattab" type="button" data-cat="" aria-pressed="${!state.category}">${icon('grid', { size: 18 })}All <small>${all.length}</small></button>
        ${categories.map((c) => `<button class="cattab" type="button" data-cat="${c.id}" aria-pressed="${state.category === c.id}">${icon(c.icon, { size: 18 })}${c.name}<small>${catCount[c.id] ?? 0}</small></button>`).join('')}
      </div>

      <div class="shop">
        <aside class="shop__side" id="filters" aria-label="Filters">
          <div class="shop__side-head"><h2>Filters</h2><button class="icon-btn" type="button" id="filters-close" aria-label="Close filters">${icon('close', { size: 20 })}</button></div>
          <div class="fgroup">
            <h3>Brand</h3>
            <div class="fchecks">
              ${brandList.map((b) => `<label class="fcheck"><input type="checkbox" name="brand" value="${b.toLowerCase()}" ${state.brands.includes(b.toLowerCase()) ? 'checked' : ''}><span class="fcheck__box">${icon('check', { size: 14 })}</span><span class="fcheck__label">${b}</span><small>${brandCount[b.toLowerCase()]}</small></label>`).join('')}
            </div>
          </div>
          <div class="fgroup">
            <h3>Price <output id="max-out">up to ${inr(state.max)}</output></h3>
            <input class="range" id="max" type="range" min="1000" max="${priceMax}" step="500" value="${state.max}" aria-label="Maximum price">
            <div class="range__ends"><span>${inr(1000)}</span><span>${inr(priceMax)}</span></div>
          </div>
          <div class="fgroup">
            <h3>Availability</h3>
            <label class="switch"><input type="checkbox" id="stock" ${state.stock ? 'checked' : ''}><span class="switch__track"></span><span>In stock only</span></label>
          </div>
          <div class="shop__side-foot"><button class="btn btn--ghost btn--block" type="button" id="reset">Reset filters</button><button class="btn btn--primary btn--block" type="button" id="apply">Show results</button></div>
        </aside>

        <div class="shop__main">
          <div class="toolbar">
            <button class="btn btn--ghost btn--sm toolbar__filters" type="button" id="filters-open">${icon('grid', { size: 16 })} Filters <span class="toolbar__n" id="filters-n" hidden></span></button>
            <p class="toolbar__count" id="count" aria-live="polite"></p>
            <div class="toolbar__right">
              <label class="toolbar__sort"><span class="sr">Sort by</span>
                <select class="input" id="sort">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}" ${state.sort === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
              <div class="viewtoggle" role="group" aria-label="Layout">
                <button type="button" data-view="grid" aria-pressed="${state.view === 'grid'}" aria-label="Grid view">${icon('grid', { size: 18 })}</button>
                <button type="button" data-view="list" aria-pressed="${state.view === 'list'}" aria-label="List view">${icon('menu', { size: 18 })}</button>
              </div>
            </div>
          </div>
          <div class="chips" id="chips" aria-label="Active filters"></div>
          <div class="sgrid" id="list"></div>
        </div>
      </div>
      <div class="store__assure">${assurance()}</div>
    </div>
  </section>
  ${ctaBand({ title: "Can't find what you're looking for?", text: 'We can source most models from our brand partners. Tell us what you need and we will reply with availability and price.' })}`;

  const $ = (s) => document.querySelector(s);
  const list = $('#list');

  const matches = (p) =>
    (!state.category || p.category === state.category) &&
    (!state.brands.length || state.brands.includes(p.brand.toLowerCase())) &&
    p.price <= state.max &&
    (!state.stock || p.stock > 0) &&
    (!state.q.trim() || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(state.q.trim().toLowerCase()));

  const active = () => {
    const a = [];
    if (state.category) a.push({ label: categories.find((c) => c.id === state.category)?.name, drop: () => (state.category = '') });
    state.brands.forEach((b) => a.push({ label: brandList.find((x) => x.toLowerCase() === b) ?? b, drop: () => (state.brands = state.brands.filter((x) => x !== b)) }));
    if (state.max < priceMax) a.push({ label: `Up to ${inr(state.max)}`, drop: () => (state.max = priceMax) });
    if (state.stock) a.push({ label: 'In stock', drop: () => (state.stock = false) });
    if (state.q.trim()) a.push({ label: `“${state.q.trim()}”`, drop: () => (state.q = '') });
    return a;
  };

  const syncControls = () => {
    document.querySelectorAll('.cattab').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === state.category)));
    document.querySelectorAll('input[name=brand]').forEach((i) => (i.checked = state.brands.includes(i.value)));
    $('#max').value = state.max;
    $('#max-out').textContent = `up to ${inr(state.max)}`;
    $('#stock').checked = state.stock;
    $('#q').value = state.q;
  };

  const paint = () => {
    let rows = all.filter(matches);
    if (state.sort === 'low') rows = [...rows].sort((a, b) => a.price - b.price);
    if (state.sort === 'high') rows = [...rows].sort((a, b) => b.price - a.price);
    if (state.sort === 'rating') rows = [...rows].sort((a, b) => b.rating - a.rating);
    const chips = active();
    $('#count').innerHTML = `<strong>${rows.length}</strong> product${rows.length === 1 ? '' : 's'}`;
    $('#chips').innerHTML = chips.length
      ? `${chips.map((c, i) => `<button class="chip-x" type="button" data-i="${i}">${c.label}${icon('close', { size: 14 })}<span class="sr"> remove filter</span></button>`).join('')}<button class="chip-clear" type="button" id="clear-all">Clear all</button>`
      : '';
    $('#filters-n').hidden = !chips.length;
    $('#filters-n').textContent = chips.length;
    list.className = `sgrid${state.view === 'list' ? ' sgrid--list' : ''}`;
    list.innerHTML = rows.length
      ? rows.map(storeCard).join('')
      : `<div class="empty"><span class="empty__icon">${icon('search', { size: 28 })}</span><h3>No products match your filters</h3><p>Try removing a filter, a brand or raising the price limit.</p><button class="btn btn--primary" type="button" id="clear-empty">Clear all filters</button></div>`;
    initReveal(list);
    document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
    const url = new URL(location.href);
    const set = (k, v, on) => (on ? url.searchParams.set(k, v) : url.searchParams.delete(k));
    set('category', state.category, state.category);
    set('brand', state.brands.join(','), state.brands.length);
    set('q', state.q.trim(), state.q.trim());
    set('sort', state.sort, state.sort !== 'popular');
    set('max', state.max, state.max < priceMax);
    set('stock', '1', state.stock);
    set('view', 'list', state.view === 'list');
    history.replaceState(null, '', url);
  };
  const update = () => { syncControls(); paint(); };
  const reset = () => { Object.assign(state, { category: '', brands: [], q: '', max: priceMax, stock: false }); update(); };

  document.querySelectorAll('.cattab').forEach((b) => b.addEventListener('click', () => { state.category = b.dataset.cat; update(); }));
  document.querySelectorAll('input[name=brand]').forEach((i) => i.addEventListener('change', () => { state.brands = [...document.querySelectorAll('input[name=brand]:checked')].map((x) => x.value); paint(); }));
  $('#max').addEventListener('input', (e) => { state.max = Number(e.target.value); $('#max-out').textContent = `up to ${inr(state.max)}`; paint(); });
  $('#stock').addEventListener('change', (e) => { state.stock = e.target.checked; paint(); });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; paint(); });
  $('#q').addEventListener('input', (e) => { state.q = e.target.value; paint(); });
  $('#search-form').addEventListener('submit', (e) => { e.preventDefault(); $('#list').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { state.view = b.dataset.view; paint(); }));
  $('#reset').addEventListener('click', reset);
  $('#chips').addEventListener('click', (e) => {
    if (e.target.closest('#clear-all')) return reset();
    const c = e.target.closest('.chip-x');
    if (c) { active()[Number(c.dataset.i)].drop(); update(); }
  });
  list.addEventListener('click', (e) => e.target.closest('#clear-empty') && reset());

  // mobile filter sheet
  const side = $('#filters');
  const setSheet = (open) => { side.classList.toggle('is-open', open); document.body.classList.toggle('no-scroll', open); if (open) side.querySelector('#filters-close').focus(); else $('#filters-open').focus(); };
  $('#filters-open').addEventListener('click', () => setSheet(true));
  $('#filters-close').addEventListener('click', () => setSheet(false));
  $('#apply').addEventListener('click', () => setSheet(false));
  addEventListener('keydown', (e) => e.key === 'Escape' && side.classList.contains('is-open') && setSheet(false));

  bindFavs(list);
  paint();
}
