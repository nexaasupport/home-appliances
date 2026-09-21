import { db } from '../store.js';

// Demo-grade auth: salted SHA-256 in the browser. A real deployment must verify on a server.
const SESSION = 'ha.session';
const LOCK = 'ha.lock';
const MAX_TRIES = 5;
const LOCK_MS = 60_000;
const TTL = 8 * 36e5;

const PERMS = {
  owner: ['*'],
  staff: ['dashboard', 'enquiries', 'orders', 'customers', 'products', 'inventory', 'service'],
};
// actions that need the owner role
const OWNER_ONLY = new Set(['delete', 'profit', 'settings', 'users', 'activity', 'reports', 'export']);

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const readLock = () => { try { return JSON.parse(localStorage.getItem(LOCK)) ?? { n: 0, until: 0 }; } catch { return { n: 0, until: 0 }; } };

export async function login(email, password, remember) {
  const lock = readLock();
  if (lock.until > Date.now()) return { ok: false, locked: Math.ceil((lock.until - Date.now()) / 1000) };
  const user = db.all('users').find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.active);
  const ok = user && (await sha256(user.salt + password)) === user.hash;
  if (!ok) {
    const n = lock.n + 1;
    const locked = n >= MAX_TRIES;
    localStorage.setItem(LOCK, JSON.stringify({ n: locked ? 0 : n, until: locked ? Date.now() + LOCK_MS : 0 }));
    return { ok: false, locked: locked ? LOCK_MS / 1000 : 0, left: locked ? 0 : MAX_TRIES - n };
  }
  localStorage.removeItem(LOCK);
  const session = JSON.stringify({ uid: user.id, exp: Date.now() + TTL });
  (remember ? localStorage : sessionStorage).setItem(SESSION, session);
  db.setActor(user.name);
  db.log('auth', `${user.name} signed in`);
  return { ok: true, user };
}

export function currentUser() {
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION) ?? localStorage.getItem(SESSION));
    if (!s || s.exp < Date.now()) return null;
    const user = db.get('users', s.uid);
    if (!user?.active) return null;
    db.setActor(user.name);
    return user;
  } catch { return null; }
}

export function logout() {
  sessionStorage.removeItem(SESSION);
  localStorage.removeItem(SESSION);
  location.href = '/admin/login.html';
}

/** can(user, 'orders') for routes, can(user, 'delete') for actions. */
export function can(user, perm) {
  if (!user) return false;
  if (user.role === 'owner') return true;
  if (OWNER_ONLY.has(perm)) return false;
  return PERMS.staff.includes(perm);
}
