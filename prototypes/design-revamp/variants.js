/* THROWAWAY PROTOTYPE — three Home directions, ?variant=A|B|C. */

const { restaurants, clips } = window.FOODIO;

const money = (m) => '$' + (m / 100).toFixed(2);
const fee = (m) => (m === 0 ? 'Free delivery' : money(m) + ' delivery');
const eta = (r) => `${r.minMinutes}–${r.maxMinutes} min`;

const popular = restaurants.flatMap((r) => r.items.filter((i) => i.isPopular).map((i) => ({ ...i, r })));

/* ---------------- A — Editorial ---------------- */

function variantA() {
  const [hero, ...rest] = restaurants;

  const chrome = `
    <div class="tabbar">
      <span class="on">Eat</span><span>Clips</span><span>Cart</span><span>Orders</span>
    </div>`;

  const app = `
    <div class="app v-a">
      <div class="topbar">
        <div>
          <div class="eyebrow">Mission District</div>
          <div class="place">Good evening,<br /><em>what are we eating?</em></div>
        </div>
        <div class="avatar">M</div>
      </div>

      <div class="searchline"><span>&#9906;</span> Search dishes and restaurants</div>

      <div class="hero">
        <img src="${hero.image}" alt="" />
        <div class="scrim"></div>
        <div class="tag">Tonight's pick</div>
        <div class="body">
          <h2>${hero.name}</h2>
          <p>${hero.description}</p>
          <div class="meta">
            <span>&#9733; ${hero.rating}</span><span>${eta(hero)}</span><span>${fee(hero.deliveryFeeMinor)}</span>
          </div>
        </div>
      </div>

      <div class="sectionhead"><h3>Dishes worth the trip</h3><a href="#">All</a></div>
      <div class="rail">
        ${popular
          .slice(0, 8)
          .map(
            (d) => `
          <div class="dish">
            <img src="${d.image}" alt="" />
            <div class="n">${d.name}</div>
            <div class="p">${money(d.priceMinor)} &middot; ${d.r.name}</div>
          </div>`,
          )
          .join('')}
      </div>

      <div class="sectionhead"><h3>Near you</h3><a href="#">Map</a></div>
      ${rest
        .map(
          (r, i) => `
        <div class="row">
          <div class="idx">${String(i + 1).padStart(2, '0')}</div>
          <div class="txt">
            <h4>${r.name}</h4>
            <div class="sub">${r.cuisines.join(' &middot; ')}</div>
            <div class="sub">&#9733; ${r.rating} &middot; ${eta(r)} &middot; ${fee(r.deliveryFeeMinor)}</div>
          </div>
          <img src="${r.image}" alt="" />
        </div>`,
        )
        .join('')}
    </div>`;

  return { app, chrome, cls: 'v-a' };
}

/* ---------------- B — Dense marketplace ---------------- */

function variantB() {
  const cuisines = ['All', ...new Set(restaurants.flatMap((r) => r.cuisines))].slice(0, 10);
  const freeDelivery = restaurants.filter((r) => r.deliveryFeeMinor === 0);
  const fastest = [...restaurants].sort((a, b) => a.maxMinutes - b.maxMinutes).slice(0, 6);

  const ccard = (r) => `
    <div class="ccard">
      <div class="imgwrap">
        <img src="${r.image}" alt="" />
        <div class="heart">&#9825;</div>
        <div class="badge ${r.deliveryFeeMinor === 0 ? 'free' : ''}">${fee(r.deliveryFeeMinor)}</div>
      </div>
      <div class="n"><span>${r.name}</span><span class="rate">&#9733; ${r.rating}</span></div>
      <div class="m">${r.cuisines.join(' · ')} &middot; ${eta(r)}</div>
    </div>`;

  const chrome = `
    <div class="tabbar">
      <div class="on"><span class="ic">&#9750;</span>Home</div>
      <div><span class="ic">&#9654;</span>Clips</div>
      <div><span class="ic">&#9812;</span>Cart</div>
      <div><span class="ic">&#9776;</span>Orders</div>
    </div>`;

  const app = `
    <div class="app v-b">
      <div class="head">
        <div class="addr">
          <div>
            <div class="l">DELIVER TO</div>
            <div class="a">124 Taco Lane &#9662;</div>
          </div>
          <div class="av">M</div>
        </div>
        <div class="search"><span>&#9906;</span> Search for food or restaurants</div>
        <div class="chips">
          ${cuisines.map((c, i) => `<div class="chip ${i === 0 ? 'on' : ''}">${c}</div>`).join('')}
        </div>
      </div>

      <div class="sect"><h3>Free delivery</h3><a href="#">See all</a></div>
      <div class="carousel">${freeDelivery.map(ccard).join('')}</div>

      <div class="sect"><h3>Fastest near you</h3><a href="#">See all</a></div>
      <div class="carousel">${fastest.map(ccard).join('')}</div>

      <div class="sect"><h3>All restaurants</h3><a href="#">Filters</a></div>
      <div class="grid">
        ${restaurants
          .map(
            (r) => `
          <div class="gcard">
            <div class="imgwrap">
              <img src="${r.image}" alt="" />
              <div class="badge ${r.deliveryFeeMinor === 0 ? 'free' : ''}">${eta(r)}</div>
            </div>
            <div class="n">${r.name}</div>
            <div class="m">&#9733; ${r.rating} (${r.reviewCount}) &middot; ${r.cuisines[0]}</div>
          </div>`,
          )
          .join('')}
      </div>
    </div>`;

  return { app, chrome, cls: 'v-b' };
}

/* ---------------- C — Clips first ---------------- */

function variantC() {
  const cards = clips
    .map((c) => {
      const r = restaurants.find((x) => x.id === c.restaurantId);
      if (!r) return '';
      const dish = r.items.find((i) => i.id === c.menuItemId) ?? r.items[0];
      const isRestaurant = c.author?.kind === 'restaurant';

      return `
      <div class="feedcard">
        <img src="${c.thumbnail || r.image}" alt="" />
        <div class="grad"></div>
        <div class="proof ${isRestaurant ? 'ad' : ''}">
          <i></i>${isRestaurant ? 'From the kitchen' : 'Real delivery'}
        </div>
        <div class="info">
          <div class="cuis">${r.cuisines.join(' · ')}</div>
          <h2>${r.name}</h2>
          <div class="dish">${c.caption ?? dish.name}</div>
          <div class="meta">
            <span>&#9733; ${r.rating}</span><span>${eta(r)}</span><span>${fee(r.deliveryFeeMinor)}</span>
          </div>
        </div>
        <div class="actions">
          <div class="act"><div class="ic">&#9825;</div><div class="lb">${r.reviewCount}</div></div>
          <div class="act"><div class="ic">&#8644;</div><div class="lb">Compare</div></div>
          <div class="act order"><div class="ic">&#43;</div><div class="lb">${money(dish.priceMinor)}</div></div>
        </div>
      </div>`;
    })
    .join('');

  const chrome = `
    <div class="glasspill"><span>&#9906;</span> Search dishes<span class="av">M</span></div>
    <div class="tabbar">
      <div class="on">&#9654;</div><div>&#9750;</div><div>&#9812;</div><div>&#9776;</div>
    </div>`;

  return { app: `<div class="app v-c">${cards}</div>`, chrome, cls: 'v-c' };
}

/* ---------------- switcher ---------------- */

const VARIANTS = [
  ['A', 'Editorial', variantA],
  ['B', 'Marketplace', variantB],
  ['C', 'Clips first', variantC],
];

const screen = document.getElementById('screen');

function render() {
  const key = (new URLSearchParams(location.search).get('variant') ?? 'A').toUpperCase();
  const i = Math.max(
    0,
    VARIANTS.findIndex((v) => v[0] === key),
  );
  const [k, name, fn] = VARIANTS[i];
  const { app, chrome, cls } = fn();

  // Chrome sits beside the scroller, not inside it, so it stays pinned.
  screen.innerHTML = `${app}<div class="chrome ${cls}">${chrome}</div>`;
  document.getElementById('vkey').textContent = k;
  document.getElementById('vname').textContent = name;

  return i;
}

function go(step) {
  const i = render();
  const next = VARIANTS[(i + step + VARIANTS.length) % VARIANTS.length][0];
  const url = new URL(location.href);
  url.searchParams.set('variant', next);
  history.replaceState({}, '', url);
  render();
}

document.getElementById('prev').onclick = () => go(-1);
document.getElementById('next').onclick = () => go(1);

document.addEventListener('keydown', (e) => {
  const t = e.target;
  if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t?.isContentEditable) return;
  if (e.key === 'ArrowLeft') go(-1);
  if (e.key === 'ArrowRight') go(1);
});

render();
