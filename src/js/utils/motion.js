export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fade-up on scroll. Children of [data-stagger] get a 60ms cascade. */
export function initReveal(root = document) {
  const els = root.querySelectorAll('[data-reveal]');
  els.forEach((el) => {
    const parent = el.closest('[data-stagger]');
    if (parent) el.style.setProperty('--i', [...parent.querySelectorAll('[data-reveal]')].indexOf(el));
  });
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

/** Subtle depth: elements with data-parallax="0.1" drift while the hero is in view. */
export function initParallax() {
  if (reduced) return;
  const els = [...document.querySelectorAll('[data-parallax]')];
  if (!els.length) return;
  let ticking = false;
  const update = () => {
    const y = scrollY;
    els.forEach((el) => {
      if (y < 900) el.style.setProperty('--py', `${(y * Number(el.dataset.parallax)).toFixed(1)}px`);
    });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
}

/** Count a number up once visible: <span data-count="30" data-prefix="" data-suffix="%"> */
export function initCountUp(root = document) {
  root.querySelectorAll('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const fmt = (v) => `${el.dataset.prefix || ''}${Math.round(v).toLocaleString('en-IN')}${el.dataset.suffix || ''}`;
    if (reduced) { el.textContent = fmt(end); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1100;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = fmt(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
  });
}

/** Toast that doesn't steal focus (aria-live polite). */
export function toast(message) {
  let host = document.querySelector('.toasts');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toasts';
    host.setAttribute('aria-live', 'polite');
    document.body.append(host);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  host.append(el);
  setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 250); }, 3500);
}
