import { seedProducts } from '../data/catalog.js';

// Stand-in for the "Shared Database" in the flow diagram: localStorage, seeded from catalog.js.
const KEY = 'ha.db.v1';
export const LOW_STOCK = 3;

const seed = () => ({
  products: structuredClone(seedProducts),
  suppliers: [
    { id: 's1', name: 'ABC Electronics', phone: '+91 90000 11111' },
    { id: 's2', name: 'Southern Distributors', phone: '+91 90000 22222' },
  ],
  purchases: [
    { id: 'pu1', date: '2026-09-10', productId: 'p1', supplierId: 's1', qty: 6, cost: 29500 },
    { id: 'pu2', date: '2026-09-12', productId: 'p3', supplierId: 's2', qty: 4, cost: 47000 },
  ],
  sales: [
    { id: 'sa1', date: '2026-09-15', productId: 'p2', customer: 'Ravi', qty: 1, amount: 32490 },
    { id: 'sa2', date: '2026-09-16', productId: 'p3', customer: 'Priya', qty: 1, amount: 54990 },
    { id: 'sa3', date: '2026-09-17', productId: 'p1', customer: 'Suresh', qty: 1, amount: 34990 },
    { id: 'sa4', date: '2026-09-18', productId: 'p5', customer: 'Meena', qty: 2, amount: 13980 },
    { id: 'sa5', date: '2026-09-19', productId: 'p4', customer: 'Karthik', qty: 1, amount: 42990 },
  ],
});

let cache;
const load = () => {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY)) ?? seed();
  } catch {
    cache = seed();
  }
  return cache;
};
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* storage blocked: keep in memory */ }
};
const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const db = {
  products: () => load().products,
  product: (id) => load().products.find((p) => p.id === id),
  suppliers: () => load().suppliers,
  purchases: () => load().purchases,
  sales: () => load().sales,
  /** Average unit cost from purchase history; falls back to 80% of list price when never purchased. */
  unitCost(productId) {
    const rows = load().purchases.filter((x) => x.productId === productId);
    if (rows.length) return rows.reduce((s, x) => s + x.cost * x.qty, 0) / rows.reduce((s, x) => s + x.qty, 0);
    return (load().products.find((p) => p.id === productId)?.price ?? 0) * 0.8;
  },
  status: (p) => (p.stock <= 0 ? 'out' : p.stock <= LOW_STOCK ? 'low' : 'in'),

  upsertProduct(p) {
    const list = load().products;
    const i = list.findIndex((x) => x.id === p.id);
    if (i >= 0) list[i] = { ...list[i], ...p };
    else list.unshift({ id: uid('p'), rating: 4.5, specs: {}, description: '', photo: null, ...p });
    save();
  },
  removeProduct(id) {
    const d = load();
    d.products = d.products.filter((p) => p.id !== id);
    save();
  },
  addPurchase({ productId, supplierId, qty, cost, date }) {
    const d = load();
    d.purchases.unshift({ id: uid('pu'), productId, supplierId, qty, cost, date });
    const p = d.products.find((x) => x.id === productId);
    if (p) p.stock += qty;
    save();
  },
  addSale({ productId, customer, qty, amount, date }) {
    const d = load();
    const p = d.products.find((x) => x.id === productId);
    if (!p || p.stock < qty) return false;
    p.stock -= qty;
    d.sales.unshift({ id: uid('sa'), productId, customer, qty, amount, date });
    save();
    return true;
  },
  reset() {
    cache = seed();
    save();
  },
};
