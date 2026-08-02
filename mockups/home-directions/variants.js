/* THROWAWAY PROTOTYPE — Home directions, ?variant=B|C|D|F|H|I|J|K|L|M.
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
  const alts = restaurants
    .slice(1, 3)
    .map((r) => ({ r, d: r.items.find((i) => i.isPopular) ?? r.items[0] }));

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

function variantJ() {
  const pick = (rid, iid) => {
    const r = restaurants.find((x) => x.id === rid);
    return { r, d: r.items.find((i) => i.id === iid) };
  };

  const pho = pick('rest-8', 'r8-pop-1');
  const ramen = pick('rest-3', 'r3-ram-2');
  const birria = pick('rest-1', 'r1-pop-1');

  const turns = [
    {
      ...pho,
      say: `<b>Pho House Vietnam</b> simmers its beef broth for eighteen hours. The warmest ${money(pho.d.priceMinor)} in the city.`,
    },
    {
      ...ramen,
      say: `<b>Sakura Sushi Bar</b> is the fastest hot bowl tonight &mdash; ${ramen.d.name} at your door in as little as ${ramen.r.minMinutes} minutes.`,
    },
    {
      ...birria,
      say: `And if warm means dippable, <b>Taco Fiesta</b>&#8217;s birria lands with hot consom&eacute;. ${birria.r.reviewCount} regulars back me up.`,
    },
  ];

  const card = ({ r, d }) => `
    <div class="pick">
      <img src="${d.image}" alt="" />
      <div class="t">
        <h4>${d.name}</h4>
        <div class="s">${r.name} &middot; ${eta(r)}</div>
      </div>
      <div class="buy">
        <div class="p">${money(d.priceMinor)}</div>
        <div class="btn">Order</div>
      </div>
    </div>`;

  const chrome = `
    <div class="tabbar">
      <span class="on">Ask</span><span>Clips</span><span>Cart</span><span>Orders</span>
    </div>`;

  const app = `
    <div class="app v-j">
      <div class="eyebrow">Tuesday &middot; 7:04 PM &middot; Mission District</div>
      <h1 class="q">What sounds<br /><em>good</em> tonight?</h1>

      <div class="composer">
        <span class="typed">something warm and under $15<span class="caret"></span></span>
        <div class="send">&#8593;</div>
      </div>

      <div class="pills">
        <div class="pill">&#8220;The usual&#8221;</div>
        <div class="pill on">&#8220;Something warm&#8221;</div>
        <div class="pill">&#8220;Surprise me&#8221;</div>
        <div class="pill">&#8220;I&#8217;m broke&#8221;</div>
      </div>

      <div class="reply">
        <div class="who"><i></i>Foodio</div>
        <div class="lede">Warm, under fifteen &mdash; I have three.</div>
        ${turns.map((t) => `<div class="turn"><p class="say">${t.say}</p>${card(t)}</div>`).join('')}
        <p class="say out">Not quite? Say more &mdash; spicier, faster, cheaper &mdash; or <span class="browse">see all ten kitchens</span>.</p>
      </div>
    </div>`;

  return { app, chrome, cls: 'v-j' };
}

/* ================= K — Tonight ==========================================
   FABRIC: TIME. You pick when you eat; the food follows. Now is hardcoded
   6:54 PM, target 7:30. Every row states its promise as a door-time and
   plots it on a shared runway toward the deadline. Accent: phosphor mint.
   ========================================================================= */

function variantK() {
  const NOW = 18 * 60 + 54; // 6:54 PM
  const TARGET = 19 * 60 + 30; // 7:30 PM, the chosen slot
  const SPAN = TARGET - NOW; // 36 min window

  const fmt = (m) => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')}`;

  const rows = restaurants
    .map((r) => {
      const early = NOW + r.minMinutes;
      const late = NOW + r.maxMinutes;
      return { r, early, late, margin: TARGET - late };
    })
    .sort((a, b) => b.margin - a.margin);

  const makes = rows.filter((x) => x.margin >= 0);
  const misses = rows.filter((x) => x.margin < 0);

  const nextSlot = (late) => {
    let s = TARGET;
    while (s < late) s += 30;
    return s;
  };

  const pct = (m) => Math.min(((m - NOW) / SPAN) * 100, 100);

  const row = ({ r, early, late, margin }) => {
    const dish = r.items.find((i) => i.isPopular) ?? r.items[0];
    const x0 = pct(early);
    const x1 = pct(late);
    const chip = margin >= 0 ? `+${margin} min` : `fits ${fmt(nextSlot(late))}`;
    return `
    <div class="krow ${margin < 0 ? 'miss' : ''}">
      <div class="top">
        <div class="when"><b>${fmt(late)}</b><span>at your door</span></div>
        <div class="who">
          <h4>${r.name}</h4>
          <div class="sub">${dish.name} &middot; ${money(dish.priceMinor)}</div>
        </div>
        <img src="${r.image}" alt="" />
      </div>
      <div class="run">
        <div class="track"><i style="left:${x0.toFixed(1)}%;width:${Math.max(x1 - x0, 2).toFixed(1)}%"></i></div>
        <span class="mg">${chip}</span>
      </div>
    </div>`;
  };

  // Dial spans 6:30 -> 8:30; now sits at 20%, the chosen 7:30 at 50%.
  const labels = [
    { t: '6:30' },
    { t: '7:00' },
    { t: '7:30', on: true },
    { t: '8:00' },
    { t: '8:30' },
  ];
  const ticks = Array.from(
    { length: 25 },
    (_, i) => `<i class="${i % 6 === 0 ? 'maj' : ''}${i < 5 ? ' past' : ''}"></i>`,
  ).join('');

  const chrome = `
    <div class="tabbar">
      <span class="on">Tonight</span><span>Clips</span><span>Cart</span><span>Orders</span>
    </div>`;

  const app = `
    <div class="app v-k">
      <div class="head">
        <div class="topbar">
          <div class="loc">Mission District &#9662;</div>
          <div class="now"><i></i>NOW 6:54 PM</div>
        </div>
        <div class="lede">On your table by</div>
        <div class="dial">
          <div class="dlabels">
            ${labels.map((l, i) => `<span class="${l.on ? 'on' : ''}" style="left:${i * 25}%">${l.t}</span>`).join('')}
          </div>
          <div class="needle"></div>
          <div class="dticks">${ticks}</div>
          <div class="dwin" style="left:20%"></div>
          <div class="dnow" style="left:20%"></div>
          <div class="dnowlb" style="left:20%">now</div>
        </div>
        <div class="statline">
          <span>${SPAN} min from now</span>
          <span>${makes.length} of ${restaurants.length} kitchens make it</span>
        </div>
      </div>

      <div class="shead"><span>Makes 7:30</span><span>most spare first</span></div>
      ${makes.map(row).join('')}

      <div class="shead miss"><span>Won&#8217;t make it</span><span>arrives after 7:30</span></div>
      ${misses.map(row).join('')}

      <div class="hold">quotes hold until ${fmt(NOW + 4)} PM</div>
    </div>`;

  return { app, chrome, cls: 'v-k' };
}

/* ================= L — The Block ===========================================
   FABRIC: SPACE. The neighborhood is the interface. A dark stylized map —
   gradient ground, a rotated street grid — with home glowing at center and
   each kitchen as a lit window, sized and brightened by rating. Night air,
   not Google Maps. Accent: sodium-lamp amber.
   ========================================================================= */

function variantL() {
  const LAT_MAX = 37.8003;
  const LAT_MIN = 37.7599;
  const LNG_MIN = -122.4644;
  const LNG_MAX = -122.4056;

  // Geo → viewport %. X spans 7–93, Y spans 6–50 so every dot clears the peek card.
  const nx = (r) => (r.longitude - LNG_MIN) / (LNG_MAX - LNG_MIN);
  const ny = (r) => (LAT_MAX - r.latitude) / (LAT_MAX - LAT_MIN);
  const px = (r) => 7 + nx(r) * 86;
  const py = (r) => 6 + ny(r) * 44;

  const HOME = { x: 0.5, y: 0.51 }; // 124 Taco Lane
  const homeLeft = 7 + HOME.x * 86;
  const homeTop = 6 + HOME.y * 44;

  const sel = restaurants.find((r) => r.id === 'rest-1'); // Taco Fiesta
  const dish = sel.items.find((i) => i.isPopular) ?? sel.items[0];

  // The three nearest neighbors get name labels; everyone else is just a light.
  const dist = (r) => Math.hypot(nx(r) - HOME.x, ny(r) - HOME.y);
  const named = new Set(
    restaurants
      .filter((r) => r.id !== sel.id)
      .sort((a, b) => dist(a) - dist(b))
      .slice(0, 3)
      .map((r) => r.id),
  );

  const spots = restaurants
    .map((r) => {
      const isSel = r.id === sel.id;
      const s = Math.round(7 + (r.rating - 4.5) * 18);
      const glow = (0.3 + (r.rating - 4.5) * 1.4).toFixed(2);
      // Labels point away from the right edge, except in the home band where
      // a leftward label would run across the "You" marker.
      const side = nx(r) > 0.55 && Math.abs(ny(r) - HOME.y) > 0.09 ? 'lab-l' : 'lab-r';
      const label = isSel
        ? `<span class="tag sel ${side}">${r.name}</span>`
        : named.has(r.id)
          ? `<span class="tag ${side}">${r.name}</span>`
          : '';
      return `
      <div class="spot${isSel ? ' issel' : ''}" style="left:${px(r).toFixed(1)}%;top:${py(r).toFixed(1)}%">
        ${isSel ? '<i class="ring"></i><i class="ring r2"></i>' : ''}
        <i class="dot" style="width:${s}px;height:${s}px;box-shadow:0 0 ${s}px rgba(255,205,140,.55),0 0 ${s * 2.6}px rgba(255,176,80,${glow})"></i>
        ${label}
      </div>`;
    })
    .join('');

  const app = `<div class="app v-l">
      <div class="ground"></div>
      <div class="mapclip">
        <div class="streets">
          <i class="park"><b>DOLORES PARK</b></i>
          <span class="street" style="left:40%;top:46%">MISSION ST</span>
          <span class="street vert" style="left:58%;top:36%">VALENCIA ST</span>
        </div>
      </div>
      <div class="lamplight" style="background:radial-gradient(circle at ${homeLeft}% ${homeTop.toFixed(1)}%, rgba(255,178,86,.13), rgba(255,178,86,.05) 20%, transparent 46%)"></div>
      <div class="vignette"></div>
      <div class="geo">
        <div class="home" style="left:${homeLeft}%;top:${homeTop.toFixed(1)}%">
          <i class="beacon"></i><i class="hdot"></i><span class="hlab">You</span>
        </div>
        ${spots}
      </div>
    </div>`;

  const chrome = `
    <div class="toppill"><span class="ic">&#8962;</span>124 Taco Lane<span class="car">&#9662;</span></div>
    <div class="peek">
      <div class="grab"></div>
      <div class="whereline">South of Mission St &middot; open till 11</div>
      <div class="prow">
        <img src="${sel.image}" alt="" />
        <div class="pt">
          <h2>${sel.name}</h2>
          <div class="pmeta"><b>&#9733; ${sel.rating}</b> (${sel.reviewCount}) &middot; ${sel.cuisines.join(' &middot; ')}</div>
          <div class="pmeta dim">${eta(sel)} &middot; ${fee(sel.deliveryFeeMinor)}</div>
        </div>
      </div>
      <div class="dish">
        <img src="${dish.image}" alt="" />
        <div class="dt">
          <h4>${dish.name}</h4>
          <div class="ds">&#9733; ${dish.rating} &middot; the one to get</div>
        </div>
        <div class="dp">${money(dish.priceMinor)}</div>
      </div>
      <div class="orderbtn">Order &middot; ${eta(sel)}</div>
    </div>`;

  return { app, chrome, cls: 'v-l' };
}

function variantM() {
  const deck = dishes.slice(0, 24);
  const at = 2; /* fake state: third card of tonight's deck */
  const cur = deck[at];
  const next = deck[at + 1];
  const pct = (((at + 1) / deck.length) * 100).toFixed(1);

  const app = `
    <div class="app v-m">
      <div class="top">
        <div class="row">
          <div class="brand">FOODIO</div>
          <div class="count">${at + 1} <span>of ${deck.length}</span></div>
        </div>
        <div class="track"><i style="width:${pct}%"></i></div>
      </div>

      <div class="deck">
        <div class="ghost"></div>
        <div class="peek"><img src="${next.image}" alt="" /></div>
        <div class="card">
          <img src="${cur.image}" alt="" />
          <div class="shade"></div>
          <div class="info">
            <div class="from">${cur.r.name}</div>
            <h1>${cur.name}</h1>
            <div class="meta">
              <b>${money(cur.priceMinor)}</b><i>&middot;</i><span>${eta(cur.r)}</span><i>&middot;</i><span>&#9733; ${cur.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const chrome = `
    <div class="verbs">
      <div class="verb pass">PASS</div>
      <div class="verb eat">EAT</div>
    </div>`;

  return { app, chrome, cls: 'v-m' };
}

/* ---------------- switcher ---------------- */

const VARIANTS = [
  ['B', 'Marketplace', variantB],
  ['C', 'Clips first', variantC],
  ['D', 'Dish first', variantD],
  ['F', 'Clips + list', variantF],
  ['H', 'Gallery', variantH],
  ['I', 'Decided', variantI],
  ['J', 'Ask', variantJ],
  ['K', 'Tonight', variantK],
  ['L', 'The Block', variantL],
  ['M', 'One', variantM],
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
  if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t?.isContentEditable)
    return;
  if (e.key === 'ArrowLeft') go(-1);
  if (e.key === 'ArrowRight') go(1);
});

render();
