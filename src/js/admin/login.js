import '@fontsource-variable/inter';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '../../scss/main.scss';
import { currentUser, login } from './auth.js';
import { db } from '../store.js';
import { icon } from './ui.js';

const next = () => { const n = new URLSearchParams(location.search).get('next'); return `/admin/index.html${n && n.startsWith('#/') ? n : '#/dashboard'}`; };
if (currentUser()) location.replace(next());

const s = db.settings();
document.querySelector('#app').innerHTML = `
<div class="login">
  <section class="login__brand">
    <div class="login__brand-in">
      <span class="login__logo">${icon('home', { size: 40 })}</span>
      <h1>${s.name} Admin</h1>
      <p>Run enquiries, orders, stock and service from one place.</p>
      <ul class="login__points">
        <li>${icon('headset', { size: 18 })} Website enquiries land here instantly</li>
        <li>${icon('receipt', { size: 18 })} Quotes, orders and printable invoices</li>
        <li>${icon('truck', { size: 18 })} Stock updates itself with every order</li>
      </ul>
    </div>
  </section>
  <form class="login__form" id="login" novalidate>
    <h2>Welcome back</h2>
    <p class="login__sub">Sign in to manage your store.</p>
    <div class="field"><label for="u">Email</label><input class="input" id="u" name="u" type="email" autocomplete="username" required></div>
    <div class="field"><label for="p">Password</label><div class="pw"><input class="input" id="p" name="p" type="password" autocomplete="current-password" required><button class="icon-btn" type="button" id="show" aria-label="Show password">${icon('eye')}</button></div></div>
    <label class="login__remember"><input type="checkbox" id="remember"> Keep me signed in on this device</label>
    <p class="error" id="err" role="alert"></p>
    <button class="btn btn--primary btn--block btn--lg" type="submit" id="go">Sign in</button>
    <div class="login__demo"><strong>Demo accounts</strong><span>Owner: <code>admin@nexaa.in</code> / <code>admin123</code></span><span>Staff: <code>staff@nexaa.in</code> / <code>staff123</code></span></div>
    <a class="login__back" href="/index.html">${icon('arrow', { size: 14 })} Back to website</a>
  </form>
</div>`;

const $ = (q) => document.querySelector(q);
$('#show').addEventListener('click', (e) => { const p = $('#p'); const on = p.type === 'password'; p.type = on ? 'text' : 'password'; e.currentTarget.setAttribute('aria-label', on ? 'Hide password' : 'Show password'); });
$('#login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('#err'), btn = $('#go');
  if (!$('#u').value.trim() || !$('#p').value) { err.textContent = 'Enter your email and password.'; return; }
  btn.disabled = true; btn.textContent = 'Signing in…';
  const r = await login($('#u').value, $('#p').value, $('#remember').checked);
  if (r.ok) { location.href = next(); return; }
  btn.disabled = false; btn.textContent = 'Sign in';
  err.textContent = r.locked ? `Too many attempts. Try again in ${r.locked} seconds.` : `Incorrect email or password.${r.left ? ` ${r.left} attempt${r.left === 1 ? '' : 's'} left.` : ''}`;
  $('#p').value = ''; $('#p').focus();
});
