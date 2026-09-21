import { seedProducts, site } from '../data/catalog.js';

/*
 * Nexaa data layer: a small "database" in localStorage shared by the public site and the admin.
 * Demo-grade by design (per browser, no server). Swap the load()/save() pair for API calls to go multi-device.
 */
const KEY = 'ha.db.v3';
const OLD_KEY = 'ha.db.v2';
export const LOW_STOCK = 3;

const day = 864e5;
const ago = (days, hours = 0) => new Date(Date.now() - days * day - hours * 36e5).toISOString();
const ahead = (days) => new Date(Date.now() + days * day).toISOString().slice(0, 10);
const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const digits = (s) => String(s ?? '').replace(/\D/g, '').slice(-10);

const money = (o) => {
  const subtotal = o.items.reduce((s, i) => s + i.qty * i.price, 0);
  return { subtotal, total: Math.max(0, subtotal - (o.discount || 0)) };
};

function seed(oldProducts) {
  const products = (oldProducts ?? structuredClone(seedProducts)).map((p) => ({
    status: 'active', sku: `NX-${p.id.toUpperCase()}`, cost: Math.round((p.price * 0.82) / 10) * 10, featured: false, ...p,
  }));
  const price = (id) => products.find((p) => p.id === id)?.price ?? 0;
  const nameOf = (id) => products.find((p) => p.id === id)?.name ?? 'Product';
  const line = (productId, qty) => ({ productId, name: nameOf(productId), qty, price: price(productId) });
  const order = (n, o) => {
    const t = money(o);
    return { id: `o${n}`, invoiceNo: `NX-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`, discount: 0, notes: '', reserved: false, payments: [], history: [], ...o, ...t };
  };
  const pay = (amount, method, days) => ({ id: uid('pay'), amount, method, date: ago(days) });

  const orders = [
    order(1, { customerId: 'c3', items: [line('p2', 1)], status: 'completed', reserved: true, createdAt: ago(16), payments: [pay(32490, 'UPI', 16)], delivery: { address: 'Madurai', date: ago(14).slice(0, 10) } }),
    order(2, { customerId: 'c2', items: [line('p3', 1)], status: 'delivered', reserved: true, createdAt: ago(9), payments: [pay(54990, 'Card', 9)], delivery: { address: 'Tirunelveli', date: ago(6).slice(0, 10) } }),
    order(3, { customerId: 'c1', items: [line('p1', 1)], status: 'confirmed', reserved: true, createdAt: ago(3), payments: [pay(10000, 'Cash', 3)], delivery: { address: 'Chennai', date: ahead(2) } }),
    order(4, { customerId: 'c4', items: [line('p5', 2)], status: 'completed', reserved: true, createdAt: ago(21), payments: [pay(13980, 'Cash', 21)], delivery: { address: 'Coimbatore', date: ago(20).slice(0, 10) } }),
    order(5, { customerId: 'c5', items: [line('p4', 1)], status: 'quote', createdAt: ago(1), delivery: { address: 'Coimbatore', date: ahead(5) } }),
    order(6, { customerId: 'c2', items: [line('p13', 1)], discount: 500, status: 'completed', reserved: true, createdAt: ago(27), payments: [pay(11990, 'UPI', 27)], delivery: { address: 'Tirunelveli', date: ago(25).slice(0, 10) } }),
    order(7, { customerId: 'c1', items: [line('p9', 2)], status: 'cancelled', createdAt: ago(12), delivery: { address: 'Chennai', date: '' } }),
  ];
  orders.forEach((o) => o.history.push({ status: o.status, at: o.createdAt, by: 'System' }));

  return {
    settings: {
      name: site.name, tagline: site.tagline, phone: site.phone, whatsapp: site.whatsapp, email: site.email, address: site.address, hours: site.hours,
      lowStock: LOW_STOCK, invoicePrefix: 'NX', invoiceSeq: 7, invoiceFooter: 'Thank you for shopping with Nexaa. Keep this invoice for warranty and service.', taxRate: 0, gstin: '',
    },
    users: [
      { id: 'u1', name: 'Store Owner', email: 'admin@nexaa.in', role: 'owner', active: true, salt: 'nx-owner', hash: 'd7e631989041eb690f9ad85372b9fb0019e49154403a17254090154812a2c780' },
      { id: 'u2', name: 'Counter Staff', email: 'staff@nexaa.in', role: 'staff', active: true, salt: 'nx-staff', hash: 'd1ba2028441a528411e5f8a7522092743c2bdd5ab03a7fd7d800e6483479fc62' },
    ],
    products,
    customers: [
      { id: 'c1', name: 'Ramesh Kumar', phone: '+91 98400 11111', email: 'ramesh@example.com', address: 'Anna Nagar, Chennai', createdAt: ago(40) },
      { id: 'c2', name: 'Priya S.', phone: '+91 98400 22222', email: '', address: 'Palayamkottai, Tirunelveli', createdAt: ago(35) },
      { id: 'c3', name: 'Sathish M.', phone: '+91 98400 33333', email: '', address: 'KK Nagar, Madurai', createdAt: ago(30) },
      { id: 'c4', name: 'Meena R.', phone: '+91 98400 44444', email: 'meena@example.com', address: 'RS Puram, Coimbatore', createdAt: ago(25) },
      { id: 'c5', name: 'Karthik V.', phone: '+91 98400 55555', email: '', address: 'Gandhipuram, Coimbatore', createdAt: ago(3) },
    ],
    enquiries: [
      { id: 'e1', source: 'website', productId: 'p4', name: 'WhatsApp visitor', phone: '', topic: 'Product enquiry', message: '', status: 'new', notes: '', createdAt: ago(0, 2) },
      { id: 'e2', source: 'contact-form', productId: '', name: 'Anitha Devi', phone: '+91 97000 12345', topic: 'Price or offer', message: 'Looking for a 7 kg front load washer under ₹30,000. Any festival offer?', status: 'new', notes: '', createdAt: ago(0, 5) },
      { id: 'e3', source: 'website', productId: 'p1', name: 'Ramesh Kumar', phone: '+91 98400 11111', topic: 'Product enquiry', message: 'Interested in the Samsung 253L. Is exchange available?', status: 'won', notes: 'Confirmed, advance ₹10,000 paid.', customerId: 'c1', orderId: 'o3', createdAt: ago(4) },
      { id: 'e4', source: 'phone', productId: 'p3', name: 'Priya S.', phone: '+91 98400 22222', topic: 'Product enquiry', message: 'Asked for 55" TV price and delivery.', status: 'quoted', notes: 'Quoted ₹54,990. Waiting for confirmation.', customerId: 'c2', createdAt: ago(2) },
      { id: 'e5', source: 'walk-in', productId: 'p12', name: 'Vignesh', phone: '+91 96000 77777', topic: 'Product enquiry', message: 'Window AC for a small shop.', status: 'contacted', notes: 'Called back, will visit on Saturday.', createdAt: ago(1) },
      { id: 'e6', source: 'website', productId: 'p8', name: 'WhatsApp visitor', phone: '', topic: 'Product enquiry', message: '', status: 'lost', notes: 'No reply after two follow-ups.', createdAt: ago(9) },
    ],
    orders,
    services: [
      { id: 's1', type: 'installation', customerId: 'c2', orderId: 'o2', productId: 'p3', technician: 'Arun', date: ahead(1), status: 'scheduled', notes: 'Wall mount + Google TV setup.', createdAt: ago(2) },
      { id: 's2', type: 'repair', customerId: 'c3', orderId: 'o1', productId: 'p2', technician: '', date: '', status: 'open', notes: 'Drain noise on spin cycle.', createdAt: ago(1) },
      { id: 's3', type: 'delivery', customerId: 'c1', orderId: 'o3', productId: 'p1', technician: 'Suresh', date: ahead(2), status: 'scheduled', notes: 'Second floor, no lift.', createdAt: ago(1) },
      { id: 's4', type: 'warranty', customerId: 'c4', orderId: 'o4', productId: 'p5', technician: 'Arun', date: ago(10).slice(0, 10), status: 'done', notes: 'Jar lid replaced under warranty.', createdAt: ago(12) },
    ],
    suppliers: [
      { id: 'sp1', name: 'ABC Electronics', contact: 'Mr. Rao', phone: '+91 90000 11111', email: 'sales@abc.example', city: 'Chennai' },
      { id: 'sp2', name: 'Southern Distributors', contact: 'Ms. Lakshmi', phone: '+91 90000 22222', email: '', city: 'Coimbatore' },
      { id: 'sp3', name: 'Kitchen & Home Supplies', contact: 'Mr. Anand', phone: '+91 90000 33333', email: '', city: 'Madurai' },
    ],
    purchases: [
      { id: 'pu1', supplierId: 'sp1', items: [{ productId: 'p1', qty: 6, cost: 28700 }], status: 'received', createdAt: ago(30), receivedAt: ago(28) },
      { id: 'pu2', supplierId: 'sp2', items: [{ productId: 'p4', qty: 4, cost: 35200 }, { productId: 'p12', qty: 3, cost: 22800 }], status: 'ordered', createdAt: ago(2) },
    ],
    movements: [],
    activity: [
      { id: 'a1', type: 'order', text: 'Order NX-' + new Date().getFullYear() + '-0003 confirmed', at: ago(3), by: 'Store Owner' },
      { id: 'a2', type: 'stock', text: 'Received purchase from ABC Electronics', at: ago(28), by: 'Store Owner' },
      { id: 'a3', type: 'service', text: 'Service request s4 marked done', at: ago(10), by: 'Counter Staff' },
    ],
  };
}

let cache = null;
const subs = new Set();
const notify = (why) => subs.forEach((fn) => { try { fn(why); } catch { /* a view failed to refresh: ignore */ } });

function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return (cache = JSON.parse(raw));
    let oldProducts;
    try { oldProducts = JSON.parse(localStorage.getItem(OLD_KEY))?.products; } catch { /* no old data */ }
    cache = seed(oldProducts);
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    cache ??= seed();
  }
  return cache;
}
function save(why) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    dispatchEvent(new CustomEvent('ha:quota')); // storage full or blocked: keep working in memory
  }
  notify(why);
}
addEventListener('storage', (e) => { if (e.key === KEY) { cache = null; notify('external'); } });

let actor = 'System';
const list = (name) => load()[name];

export const db = {
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  setActor(name) { actor = name; },

  // ---- generic collections ----
  all: (name) => list(name),
  get: (name, id) => list(name).find((x) => x.id === id),
  put(name, obj) {
    const rows = list(name);
    const i = rows.findIndex((x) => x.id === obj.id);
    if (i >= 0) { rows[i] = { ...rows[i], ...obj }; save(name); return rows[i]; }
    const row = { id: uid(name[0]), createdAt: new Date().toISOString(), ...obj };
    rows.unshift(row);
    save(name);
    return row;
  },
  del(name, id) {
    const rows = list(name);
    const i = rows.findIndex((x) => x.id === id);
    if (i < 0) return null;
    const [gone] = rows.splice(i, 1);
    save(name);
    return gone;
  },
  restore(name, row) { list(name).unshift(row); save(name); },

  // ---- settings, activity ----
  settings: () => list('settings'),
  saveSettings(patch) { Object.assign(list('settings'), patch); save('settings'); },
  log(type, text, ref) {
    const rows = list('activity');
    rows.unshift({ id: uid('a'), type, text, ref, at: new Date().toISOString(), by: actor });
    rows.length = Math.min(rows.length, 300);
    save('activity');
  },

  // ---- products (public site sees only active ones) ----
  allProducts: () => list('products'),
  products: () => list('products').filter((p) => p.status !== 'hidden'),
  product: (id) => list('products').find((p) => p.id === id && p.status !== 'hidden'),
  status(p) {
    if (p.stock <= 0) return 'out';
    return p.stock <= (list('settings').lowStock ?? LOW_STOCK) ? 'low' : 'in';
  },
  unitCost: (id) => list('products').find((p) => p.id === id)?.cost ?? 0,
  adjustStock(productId, delta, reason, ref) {
    const p = list('products').find((x) => x.id === productId);
    if (!p) return false;
    p.stock = Math.max(0, p.stock + delta);
    list('movements').unshift({ id: uid('m'), productId, delta, balance: p.stock, reason, ref: ref ?? '', at: new Date().toISOString(), by: actor });
    save('stock');
    return true;
  },

  // ---- customers ----
  upsertCustomer({ name, phone, email, address }) {
    const key = digits(phone);
    const found = key && list('customers').find((c) => digits(c.phone) === key);
    if (found) return db.put('customers', { id: found.id, name: name || found.name, email: email || found.email, address: address || found.address });
    return db.put('customers', { name: name || 'Customer', phone: phone || '', email: email || '', address: address || '' });
  },

  // ---- enquiries (created by the public site and by staff) ----
  addEnquiry(data) {
    if (data.source === 'website' && data.productId) { // one lead per product per 10 minutes per browser
      const k = `enq:${data.productId}`;
      try {
        if (Date.now() - Number(sessionStorage.getItem(k) ?? 0) < 6e5) return null;
        sessionStorage.setItem(k, String(Date.now()));
      } catch { /* sessionStorage blocked: skip dedupe */ }
    }
    const e = db.put('enquiries', { name: 'WhatsApp visitor', phone: '', topic: 'Product enquiry', message: '', notes: '', status: 'new', productId: '', ...data });
    const who = e.name === 'WhatsApp visitor' ? 'a website visitor' : e.name;
    db.log('enquiry', `New enquiry from ${who}${e.productId ? ` about ${list('products').find((p) => p.id === e.productId)?.name ?? ''}` : ''}`, e.id);
    return e;
  },
  setEnquiryStatus(id, status) {
    const e = db.put('enquiries', { id, status, updatedAt: new Date().toISOString() });
    db.log('enquiry', `Enquiry from ${e.name} marked ${status}`, id);
    return e;
  },

  // ---- orders ----
  orderPaid: (o) => (o.payments ?? []).reduce((s, p) => s + p.amount, 0),
  orderPayment(o) {
    const paid = db.orderPaid(o);
    return paid >= o.total && o.total > 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
  },
  createOrder({ customer, items, discount = 0, delivery = {}, notes = '', advance, enquiryId }) {
    const c = customer.id ? db.get('customers', customer.id) : db.upsertCustomer(customer);
    const s = list('settings');
    s.invoiceSeq = (s.invoiceSeq ?? 0) + 1;
    const o = { customerId: c.id, items, discount, delivery, notes, status: 'quote', reserved: false, payments: [], history: [{ status: 'quote', at: new Date().toISOString(), by: actor }], enquiryId: enquiryId ?? '',
      invoiceNo: `${s.invoicePrefix}-${new Date().getFullYear()}-${String(s.invoiceSeq).padStart(4, '0')}` };
    Object.assign(o, money(o));
    if (advance?.amount > 0) o.payments.push({ id: uid('pay'), amount: advance.amount, method: advance.method || 'Cash', date: new Date().toISOString() });
    const row = db.put('orders', o);
    if (enquiryId) db.put('enquiries', { id: enquiryId, status: 'quoted', customerId: c.id, orderId: row.id });
    db.log('order', `Order ${row.invoiceNo} created for ${c.name}`, row.id);
    return row;
  },
  updateOrder(id, patch) {
    const cur = db.get('orders', id);
    const next = { ...cur, ...patch };
    Object.assign(next, money(next));
    return db.put('orders', next);
  },
  setOrderStatus(id, status) {
    const o = db.get('orders', id);
    if (!o || o.status === status) return { ok: true, order: o };
    if (status === 'confirmed' && !o.reserved) {
      const short = o.items.find((i) => (list('products').find((p) => p.id === i.productId)?.stock ?? 0) < i.qty);
      if (short) return { ok: false, error: `Not enough stock for ${short.name}.` };
      o.items.forEach((i) => db.adjustStock(i.productId, -i.qty, `Order ${o.invoiceNo}`, o.id));
      o.reserved = true;
    }
    if (status === 'cancelled' && o.reserved) {
      o.items.forEach((i) => db.adjustStock(i.productId, i.qty, `Order ${o.invoiceNo} cancelled`, o.id));
      o.reserved = false;
    }
    o.status = status;
    o.history = [...(o.history ?? []), { status, at: new Date().toISOString(), by: actor }];
    const row = db.put('orders', o);
    if (status === 'confirmed' && o.enquiryId) db.put('enquiries', { id: o.enquiryId, status: 'won' });
    db.log('order', `Order ${o.invoiceNo} ${status}`, id);
    return { ok: true, order: row };
  },
  addPayment(id, { amount, method, note }) {
    const o = db.get('orders', id);
    const row = db.put('orders', { id, payments: [...o.payments, { id: uid('pay'), amount, method, note: note ?? '', date: new Date().toISOString() }] });
    db.log('order', `Payment of ₹${amount.toLocaleString('en-IN')} recorded on ${o.invoiceNo}`, id);
    return row;
  },

  // ---- purchasing ----
  createPurchase({ supplierId, items }) {
    const p = db.put('purchases', { supplierId, items, status: 'ordered' });
    db.log('stock', `Purchase order created for ${db.get('suppliers', supplierId)?.name ?? 'supplier'}`, p.id);
    return p;
  },
  receivePurchase(id) {
    const p = db.get('purchases', id);
    if (!p || p.status === 'received') return null;
    p.items.forEach((i) => {
      db.adjustStock(i.productId, i.qty, `Purchase received (${db.get('suppliers', p.supplierId)?.name ?? ''})`, id);
      const prod = list('products').find((x) => x.id === i.productId);
      if (prod && i.cost) prod.cost = i.cost;
    });
    const row = db.put('purchases', { id, status: 'received', receivedAt: new Date().toISOString() });
    db.log('stock', `Received purchase from ${db.get('suppliers', p.supplierId)?.name ?? 'supplier'}`, id);
    return row;
  },

  // ---- backup ----
  exportJSON: () => JSON.stringify(load(), null, 2),
  importJSON(text) {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || !Array.isArray(data.products) || !data.settings) throw new Error('This file is not a Nexaa backup.');
    cache = data;
    save('import');
  },
  reset() { cache = seed(); save('reset'); },
};
