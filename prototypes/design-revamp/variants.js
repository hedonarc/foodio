/* THROWAWAY PROTOTYPE — Home directions, ?variant=B|C|D|F|H|I.
   A (editorial), E (single column) and G (proof) were cut. Letters stay stable so
   feedback keeps its meaning. */

const { restaurants, clips } = window.FOODIO;

const money = (m) => '$' + (m / 100).toFixed(2);
const fee = (m) => (m === 0 ? 'Free delivery' : money(m) + ' delivery');
const eta = (r) => `${r.minMinutes}–${r.maxMinutes} min`;

const dishes = restaurants
  .flatMap((r) => r.items.map((i) => ({ ...i, r })))
  .filter((d) => d.category !== 'Drinks')
  .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

const clipsFor = (id) => clips.filter((c) => c.restaurantId === id);

/* ================= B — Marketplace (white, dense, carousels + grid) ========= */

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

/* ================= C — Clips first (full-bleed snapping feed) ============== */

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

/* ================= D — Dish first, dark ====================================
   B's density, but the object is the dish, not the restaurant. People crave
   pad thai, not "Bangkok Street Eats". Accent: terracotta.
   ========================================================================= */

function variantD() {
  const cravings = ['Tacos', 'Sushi', 'Pizza', 'Curry', 'Bowls', 'Burgers', 'Ramen', 'Pho'];

  const chrome = `
    <div class="tabbar">
      <div class="on"><span class="ic">&#9750;</span>Home</div>
      <div><span class="ic">&#9654;</span>Clips</div>
      <div><span class="ic">&#9812;</span>Cart</div>
      <div><span class="ic">&#9776;</span>Orders</div>
    </div>`;

  const app = `
    <div class="app v-d">
      <div class="head">
        <div class="addr">
          <div><div class="l">DELIVERING TO</div><div class="a">124 Taco Lane &#9662;</div></div>
          <div class="av">M</div>
        </div>
        <div class="search"><span>&#9906;</span> What are you craving?</div>
        <div class="chips">
          ${cravings.map((c, i) => `<div class="chip ${i === 0 ? 'on' : ''}">${c}</div>`).join('')}
        </div>
      </div>

      <div class="sect"><h3>Top rated dishes</h3><a href="#">All</a></div>
      <div class="dgrid">
        ${dishes
          .slice(0, 12)
          .map(
            (d) => `
          <div class="dcard">
            <div class="imgwrap">
              <img src="${d.image}" alt="" />
              <div class="price">${money(d.priceMinor)}</div>
              ${d.rating ? `<div class="star">&#9733; ${d.rating}</div>` : ''}
            </div>
            <div class="n">${d.name}</div>
            <div class="from">${d.r.name}</div>
          </div>`,
          )
          .join('')}
      </div>

      <div class="sect"><h3>Kitchens near you</h3><a href="#">Map</a></div>
      <div class="rlist">
        ${restaurants
          .map(
            (r) => `
          <div class="rrow">
            <img src="${r.image}" alt="" />
            <div class="t">
              <h4>${r.name}</h4>
              <div class="s">${r.cuisines.join(' · ')}</div>
              <div class="s dim">&#9733; ${r.rating} &middot; ${eta(r)} &middot; ${fee(r.deliveryFeeMinor)}</div>
            </div>
            <div class="go">&#8250;</div>
          </div>`,
          )
          .join('')}
      </div>
    </div>`;

  return { app, chrome, cls: 'v-d' };
}

/* ================= F — Clips hero + list ===================================
   C's emotional hook without making browsing slow. A swipeable clip hero on
   top, a light sheet of scannable restaurants lifting over it underneath.
   ========================================================================= */

function variantF() {
  const featured = clips.slice(0, 5).map((c) => {
    const r = restaurants.find((x) => x.id === c.restaurantId) ?? restaurants[0];
    return { c, r };
  });

  const chrome = `
    <div class="tabbar">
      <div class="on"><span class="ic">&#9750;</span>Home</div>
      <div><span class="ic">&#9654;</span>Clips</div>
      <div><span class="ic">&#9812;</span>Cart</div>
      <div><span class="ic">&#9776;</span>Orders</div>
    </div>`;

  const app = `
    <div class="app v-f">
      <div class="hero">
        <div class="hscroll">
          ${featured
            .map(
              ({ c, r }) => `
            <div class="hslide">
              <img src="${c.thumbnail || r.image}" alt="" />
              <div class="hgrad"></div>
              <div class="hproof ${c.author?.kind === 'restaurant' ? 'ad' : ''}">
                <i></i>${c.author?.kind === 'restaurant' ? 'From the kitchen' : 'Real delivery'}
              </div>
              <div class="hbody">
                <h2>${r.name}</h2>
                <p>${c.caption ?? r.cuisines.join(' · ')}</p>
                <div class="hmeta"><span>&#9733; ${r.rating}</span><span>${eta(r)}</span><span>${fee(r.deliveryFeeMinor)}</span></div>
              </div>
            </div>`,
            )
            .join('')}
        </div>
        <div class="htop"><span>&#9906;</span> Search dishes<span class="av">M</span></div>
        <div class="dots">${featured.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
      </div>

      <div class="sheet">
        <div class="grab"></div>
        <div class="sect"><h3>Near you</h3><a href="#">Filters</a></div>
        ${restaurants
          .map((r) => {
            const n = clipsFor(r.id).length;
            return `
          <div class="frow">
            <img src="${r.image}" alt="" />
            <div class="t">
              <h4>${r.name}</h4>
              <div class="s">${r.cuisines.join(' · ')}</div>
              <div class="s dim">&#9733; ${r.rating} &middot; ${eta(r)} &middot; ${fee(r.deliveryFeeMinor)}</div>
            </div>
            ${n ? `<div class="clipbadge">&#9654; ${n}</div>` : ''}
          </div>`;
          })
          .join('')}
      </div>
    </div>`;

  return { app, chrome, cls: 'v-f' };
}

/* ================= H — Gallery ===========================================
   Subtraction. No cards, no borders, no shadows, no badges. Type does the
   work and the food is a small plate beside it. Scroll is the only verb.
   ========================================================================= */

function variantH() {
  const chrome = `
    <div class="hbar">
      <span class="on">Eat</span><span>Clips</span><span>Cart</span><span>Orders</span>
    </div>`;

  const app = `
    <div class="app v-h">
      <div class="mast">
        <div class="loc">Mission District &#9662;</div>
        <div class="dot">M</div>
      </div>

      <div class="lede">Ten kitchens<br />are open.</div>

      ${restaurants
        .map(
          (r, i) => `
        <div class="entry">
          <div class="num">${String(i + 1).padStart(2, '0')}</div>
          <div class="ebody">
            <h2>${r.name}</h2>
            <div class="line">${r.cuisines.join(', ')}</div>
            <div class="line dim">${eta(r)} &nbsp;·&nbsp; ${fee(r.deliveryFeeMinor)} &nbsp;·&nbsp; ${r.rating}</div>
          </div>
          <img src="${r.image}" alt="" />
        </div>`,
        )
        .join('')}

      <div class="foot">Foodio</div>
    </div>`;

  return { app, chrome, cls: 'v-h' };
}

/* ================= I — Decided ===========================================
   Ten choices is not a feature. The app already knows the time, the address
   and the last order, so it picks one and stands behind it. Everything else
   is collapsed behind a single link.
   ========================================================================= */

function variantI() {
  const pick = restaurants[0];
  const dish = pick.items.find((i) => i.isPopular) ?? pick.items[0];
  const alts = restaurants.slice(1, 3).map((r) => ({ r, d: r.items.find((i) => i.isPopular) ?? r.items[0] }));

  const chrome = `
    <div class="cta">
      <div class="ctaline">
        <span>${dish.name}</span>
        <b>${money(dish.priceMinor)}</b>
      </div>
      <div class="ctabtn">Order &middot; arrives ${pick.maxMinutes} min</div>
    </div>`;

  const app = `
    <div class="app v-i">
      <img class="bg" src="${dish.image}" alt="" />
      <div class="veil"></div>

      <div class="content">
        <div class="clock">7:04 PM &middot; Mission District</div>
        <div class="say">Dinner is<br />sorted.</div>

        <div class="pickcard">
          <div class="plabel">Because you loved it last Tuesday</div>
          <h2>${dish.name}</h2>
          <div class="pmeta">${pick.name} &nbsp;·&nbsp; &#9733; ${pick.rating} &nbsp;·&nbsp; ${fee(pick.deliveryFeeMinor)}</div>
        </div>

        <div class="orlabel">Or</div>
        <div class="alts">
          ${alts
            .map(
              ({ r, d }) => `
            <div class="alt">
              <img src="${d.image}" alt="" />
              <div class="t">
                <h4>${d.name}</h4>
                <div class="s">${r.name} &middot; ${eta(r)}</div>
              </div>
              <div class="p">${money(d.priceMinor)}</div>
            </div>`,
            )
            .join('')}
        </div>

        <div class="browse">Browse all ${restaurants.length} kitchens</div>
      </div>
    </div>`;

  return { app, chrome, cls: 'v-i' };
}

/* ---------------- switcher ---------------- */

const VARIANTS = [
  ['B', 'Marketplace', variantB],
  ['C', 'Clips first', variantC],
  ['D', 'Dish first', variantD],
  ['F', 'Clips + list', variantF],
  ['H', 'Gallery', variantH],
  ['I', 'Decided', variantI],
];

const screen = document.getElementById('screen');

function render() {
  const key = (new URLSearchParams(location.search).get('variant') ?? 'B').toUpperCase();
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
