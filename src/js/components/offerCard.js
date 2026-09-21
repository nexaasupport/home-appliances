import { icon } from '../utils/icons.js';
import { photo } from '../utils/format.js';
import tints from '../../data/sampled-colors.json';

export const offerCard = (o, href = '/offers.html') => `
  <article class="offer offer--${o.id}" style="--bg:${tints[`offer/${o.id}`]}" data-reveal>
    <img class="offer__art" src="${photo(o.photo, 560, 500)}" alt="" width="560" height="500" loading="lazy" decoding="async">
    <div class="offer__copy">
      <span class="offer__tag">${o.badge}</span>
      <h3>${o.title}</h3>
      <p>${o.text}</p>
    </div>
    <a class="offer__btn" href="${href}">${o.cta} ${icon('arrow', { size: 16 })}</a>
  </article>`;
