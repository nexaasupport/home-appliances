import { brands, categories } from '../../data/catalog.js';
import { db } from '../store.js';
import { icon } from '../utils/icons.js';
import { productCard, bindFavs } from '../components/productCard.js';
import { initReveal } from '../utils/motion.js';

export function renderProducts() {
  const params = new URLSearchParams(location.search);
  const state = {
    category: params.get('category') || '',
    brand: params.get('brand') || '',
    q: params.get('q') || '',
    sort: params.get('sort') || 'popular',
  };
  const all = db.products();
  const brandList = [...new Set(all.map((p) => p.brand))].sort();

  document.querySelector('#main').innerHTML = `
  <section class="page-hero"><div class="container"><h1>Our Products</h1><p>Genuine appliances from trusted brands, with warranty and expert support.</p></div></section>
  <section class="section">
    <div class="container shop">
      <aside class="shop__side" aria-label="Filters">
        <div class="field"><label for="q">Search</label><input class="input" id="q" type="search" placeholder="e.g. refrigerator, LG" value="${state.q}"></div>
        <fieldset class="filter"><legend>Categories</legend>
          <label class="filter__opt"><input type="radio" name="category" value="" ${state.category ? '' : 'checked'}><span>All</span></label>
          ${categories.map((c) => `<label class="filter__opt"><input type="radio" name="category" value="${c.id}" ${state.category === c.id ? 'checked' : ''}><span>${icon(c.icon, { size: 16 })}${c.name}</span></label>`).join('')}
        </fieldset>
        <div class="field"><label for="brand">Brand</label>
          <select class="input" id="brand"><option value="">All brands</option>${brandList.map((b) => `<option ${state.brand.toLowerCase() === b.toLowerCase() ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
        <div class="field"><label for="sort">Sort by</label>
          <select class="input" id="sort"><option value="popular">Popularity</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
      </aside>
      <div class="shop__main">
        <p class="shop__count" id="count" aria-live="polite"></p>
        <div class="pgrid pgrid--shop" id="list"></div>
      </div>
    </div>
  </section>`;

  const $ = (s) => document.querySelector(s);
  const list = $('#list');

  const paint = () => {
    const q = state.q.trim().toLowerCase();
    let rows = all.filter((p) =>
      (!state.category || p.category === state.category) &&
      (!state.brand || p.brand.toLowerCase() === state.brand.toLowerCase()) &&
      (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q)));
    if (state.sort === 'low') rows = [...rows].sort((a, b) => a.price - b.price);
    if (state.sort === 'high') rows = [...rows].sort((a, b) => b.price - a.price);
    $('#count').textContent = `${rows.length} product${rows.length === 1 ? '' : 's'}`;
    list.innerHTML = rows.length
      ? rows.map((p) => productCard(p)).join('')
      : `<div class="empty"><h3>No products found</h3><p>Try a different category or search term.</p><button class="btn btn--primary" id="clear" type="button">Clear filters</button></div>`;
    initReveal(list);
    const url = new URL(location.href);
    ['category', 'brand', 'q', 'sort'].forEach((k) => (state[k] && !(k === 'sort' && state.sort === 'popular') ? url.searchParams.set(k, state[k]) : url.searchParams.delete(k)));
    history.replaceState(null, '', url);
  };

  $('#q').addEventListener('input', (e) => { state.q = e.target.value; paint(); });
  $('#brand').addEventListener('change', (e) => { state.brand = e.target.value; paint(); });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; paint(); });
  document.querySelectorAll('input[name=category]').forEach((r) => r.addEventListener('change', (e) => { state.category = e.target.value; paint(); }));
  list.addEventListener('click', (e) => {
    if (!e.target.closest('#clear')) return;
    Object.assign(state, { category: '', brand: '', q: '', sort: 'popular' });
    $('#q').value = ''; $('#brand').value = ''; $('#sort').value = 'popular';
    document.querySelector('input[name=category][value=""]').checked = true;
    paint();
  });
  bindFavs(list);
  paint();
  void brands;
}
