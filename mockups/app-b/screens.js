/* MOCKUP — B applied across the app. Switch with ?screen=. */

const { restaurants, clips } = window.FOODIO;

const money = (m) => '$' + (m / 100).toFixed(2);
const fee = (m) => (m === 0 ? 'Free delivery' : money(m) + ' delivery');
const eta = (r) => `${r.minMinutes}–${r.maxMinutes} min`;

const dishes = restaurants
  .flatMap((r) => r.items.map((i) => ({ ...i, r })))
  .filter((d) => d.category !== 'Drinks')
  .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

const clipsFor = (id) => clips.filter((c) => c.restaurantId === id);
const byId = (id) => restaurants.find((r) => r.id === id);
const categoriesFor = (id) => [...new Set((byId(id)?.items ?? []).map((i) => i.category))];
const itemsIn = (id, category) => (byId(id)?.items ?? []).filter((i) => i.category === category);
const reviewsFor = (id) => byId(id)?.reviews ?? [];

function screenHome() {
  const cuisines = ['All', ...new Set(restaurants.map((r) => r.cuisines[0]))];
  const freeDelivery = restaurants.filter((r) => r.deliveryFeeMinor === 0);
  const fastest = [...restaurants].sort((a, b) => a.maxMinutes - b.maxMinutes).slice(0, 6);

  // the badge carries the section's reason; the last line carries the rest
  const ccard = (r, badge, invert, sub) => `
    <div class="ccard">
      <div class="imgwrap">
        <img src="${r.image}" alt="" />
        <div class="heart">&#9825;</div>
        <div class="badge${invert ? ' invert' : ''}">${badge}</div>
      </div>
      <div class="n"><span class="nm">${r.name}</span><span class="rate">&#9733; ${r.rating}</span></div>
      <div class="m">${r.cuisines.join(' &middot; ')}</div>
      <div class="m dim">${sub} &middot; ${r.reviewCount} reviews</div>
    </div>`;

  const gcard = (r) => `
    <div class="gcard">
      <div class="imgwrap">
        <img src="${r.image}" alt="" />
        <div class="badge">${eta(r)}</div>
      </div>
      <div class="n">${r.name}</div>
      <div class="m">&#9733; ${r.rating} <span class="rc">(${r.reviewCount})</span> &middot; ${r.cuisines[0]}</div>
      <div class="m ${r.deliveryFeeMinor === 0 ? 'strong' : ''}">${fee(r.deliveryFeeMinor)}</div>
    </div>`;

  const chrome = `
    <div class="tabbar">
      <div class="on"><span class="ic">&#9750;</span>Home</div>
      <div><span class="ic">&#9654;</span>Clips</div>
      <div><span class="ic">&#9812;</span>Cart</div>
      <div><span class="ic">&#9776;</span>Orders</div>
    </div>`;

  const app = `
    <div class="app s-home">
      <div class="head">
        <div class="addr">
          <div class="who">
            <div class="l">DELIVER TO</div>
            <div class="a">124 Taco Lane &#9662;</div>
          </div>
          <div class="chip"><span class="av">M</span><span class="chev">&#8964;</span></div>
        </div>
        <div class="search"><span class="si">&#9906;</span> Search for food or restaurants</div>
        <div class="chips">
          ${cuisines.map((c, i) => `<div class="chip${i === 0 ? ' on' : ''}">${c}</div>`).join('')}
        </div>
      </div>

      <div class="sect"><h3>Free delivery</h3><a href="#">See all</a></div>
      <div class="carousel">
        ${freeDelivery.map((r) => ccard(r, fee(r.deliveryFeeMinor), true, eta(r))).join('')}
      </div>

      <div class="sect"><h3>Fastest near you</h3><a href="#">See all</a></div>
      <div class="carousel">
        ${fastest.map((r) => ccard(r, eta(r), false, fee(r.deliveryFeeMinor))).join('')}
      </div>

      <div class="sect"><h3>All restaurants<span class="count">${restaurants.length}</span></h3><a href="#">Filters</a></div>
      <div class="grid">${restaurants.map(gcard).join('')}</div>

      <div class="endnote">All ${restaurants.length} restaurants delivering to 124 Taco Lane</div>
    </div>`;

  return { app, chrome, cls: 's-home' };
}

/* ================= Restaurant — Taco Fiesta detail ========================= */

function screenRestaurant() {
  const r = restaurants.find((x) => x.id === 'rest-1');
  const cats = categoriesFor(r.id);
  const cl = clipsFor(r.id);
  const ours = cl.filter((c) => c.author?.kind === 'restaurant');
  const theirs = cl.filter((c) => c.author?.kind === 'customer');

  const row = (i) => `
    <div class="mrow">
      <div class="mt">
        <div class="mhead">
          <h4>${i.name}</h4>
          ${i.isPopular ? '<span class="pop">Popular</span>' : ''}
        </div>
        <p class="md">${i.description}</p>
        <div class="mbot">
          <span class="mp">${money(i.priceMinor)}</span>
          ${i.rating ? `<span class="mr">&#9733; ${i.rating}</span>` : ''}
        </div>
      </div>
      <div class="mimgwrap">
        <img src="${i.image}" alt="" />
        <div class="madd">&#43;</div>
      </div>
    </div>`;

  const clipRail = (label, list) =>
    list.length
      ? `
    <div class="sect"><h3>${label}</h3></div>
    <div class="cliprail">
      ${list
        .map(
          (c) => `
        <div class="clipcard">
          <img src="${c.thumbnail}" alt="" />
          <div class="clipcap">${c.caption}</div>
        </div>`,
        )
        .join('')}
    </div>`
      : '';

  const app = `
    <div class="app s-rest">
      <div class="hero">
        <img src="${r.image}" alt="" />
        <div class="heroTop">
          <div class="circ back">&#8249;</div>
          <div class="circ heart">&#9825;</div>
        </div>
      </div>

      <div class="identity">
        <h1>${r.name}</h1>
        <div class="idrow">
          <span class="rate">&#9733; ${r.rating}</span>
          <span class="dim">(${r.reviewCount})</span>
          <span class="dim">&middot; ${r.cuisines.join(', ')}</span>
        </div>
        <div class="metarow">
          <span>&#9201; ${eta(r)}</span>
          <span class="sep">&middot;</span>
          <span>${fee(r.deliveryFeeMinor)}</span>
          <span class="sep">&middot;</span>
          <span class="addr">${r.address}</span>
        </div>
      </div>

      <div class="catrail" id="catrail">
        ${cats.map((c, i) => `<div class="chip${i === 0 ? ' on' : ''}">${c}</div>`).join('')}
      </div>

      ${cats
        .map(
          (c) => `
        <div class="msect">
          <div class="sect"><h3>${c}</h3></div>
          ${itemsIn(r.id, c).map(row).join('')}
        </div>`,
        )
        .join('')}

      ${clipRail('From the kitchen', ours)}
      ${clipRail('From customers', theirs)}
    </div>`;

  const chrome = `
    <div class="cartbar">
      <span class="cbleft">&#9812; 2 items</span>
      <span class="cbsep">&middot;</span>
      <span class="cbtotal">$29.98</span>
      <span class="cbview">View cart &#8250;</span>
    </div>`;

  return { app, chrome, cls: 's-rest' };
}

function screenDish() {
  const r = restaurants.find((x) => x.id === 'rest-1') || restaurants[0];
  const d = r.items.find((i) => i.id === 'r1-pop-1') || r.items[0];

  const cl = clipsFor(r.id);
  const byKind = (k) => cl.find((c) => c.author && c.author.kind === k);
  const shot = byKind('restaurant') || cl[0];
  const proof = byKind('customer') || cl[1] || cl[0];

  const revs = reviewsFor(r.id) || [];
  const pid = proof && proof.author && proof.author.personId ? proof.author.personId : '';
  const buyer = pid ? revs.find((v) => v.author.toLowerCase().startsWith(pid.toLowerCase())) : null;
  const top = revs[0];
  const buyerName = buyer ? buyer.author : 'Customer';
  const buyerFace = buyer ? `<img class="av" src="${buyer.avatar}" alt="" />` : '';
  const alsoClipped = buyer && top && buyer.id === top.id ? ' &middot; posted the clip above' : '';

  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = (s) => {
    const p = String(s).split('-');
    return p.length === 3 ? MON[Number(p[1]) - 1] + ' ' + Number(p[2]) : String(s);
  };

  const qty = 2;
  const note = 'extra consomé, no onions';
  const hero = d.image.replace('w=600', 'w=1000');

  const chrome = `
    <div class="bar">
      <div class="qty">
        <span class="mn">&#8722;</span><span class="n">${qty}</span><span class="pl">&#43;</span>
      </div>
      <div class="cta">
        <span>Add ${qty} to cart</span><i>&middot;</i><b>${money(d.priceMinor * qty)}</b>
      </div>
    </div>`;

  const app = `
    <div class="app s-dish">
      <div class="hero">
        <img src="${hero}" alt="" />
        <div class="scrim"></div>
        <div class="hnav">
          <div class="rnd back">&#8249;</div>
          <div class="rnd">&#9825;</div>
        </div>
        <div class="hbadge">${d.category}</div>
      </div>

      <div class="body">
        <div class="trow">
          <h1>${d.name}</h1>
          <div class="price">${money(d.priceMinor)}</div>
        </div>
        <div class="meta">
          <b>&#9733; ${d.rating}</b><i>&middot;</i><span>${eta(r)}</span><i>&middot;</i><span>${fee(r.deliveryFeeMinor)}</span>
        </div>
        <p class="desc">${d.description}</p>

        <div class="rrow">
          <img src="${r.image}" alt="" />
          <div class="t">
            <h4>${r.name}</h4>
            <div class="s">&#9733; ${r.rating} (${r.reviewCount}) &middot; ${r.cuisines.join(' · ')}</div>
          </div>
          <div class="go">&#8250;</div>
        </div>
      </div>

      <div class="rule"></div>
      <div class="sect"><h3>Special instructions</h3><span class="opt">Optional</span></div>
      <div class="field">
        <div class="v">${note}</div>
        <div class="ct">${note.length}/200</div>
      </div>
      <div class="hint">Sent to the kitchen. Substitutions aren&#8217;t guaranteed.</div>

      <div class="rule"></div>
      <div class="sect"><h3>Clips of this dish</h3><a href="#">All clips</a></div>
      <div class="clips">
        <div class="tile">
          <div class="imgwrap">
            <img src="${shot.thumbnail}" alt="" />
            <div class="play">&#9654;</div>
            <div class="who"><img class="th" src="${r.image}" alt="" /><span>${r.name}</span></div>
          </div>
          <div class="lb">How they show it</div>
          <div class="cap">${shot.caption}</div>
        </div>
        <div class="tile">
          <div class="imgwrap">
            <img src="${proof.thumbnail}" alt="" />
            <div class="play">&#9654;</div>
            <div class="who dark">${buyerFace}<span>${buyerName}</span></div>
          </div>
          <div class="lb">How it arrived</div>
          <div class="cap">${proof.caption}</div>
        </div>
      </div>
      <div class="note">Customer clips come from completed orders.</div>

      ${
        top
          ? `<div class="rule"></div>
      <div class="sect"><h3>What people say</h3><a href="#">All ${r.reviewCount}</a></div>
      <div class="rev">
        <img class="face" src="${top.avatar}" alt="" />
        <div class="t">
          <h4>${top.author}</h4>
          <div class="rmeta"><b>&#9733; ${top.rating.toFixed(1)}</b> &middot; ${day(top.postedAt)}${alsoClipped}</div>
          <p>${top.comment}</p>
        </div>
      </div>`
          : ''
      }
    </div>`;

  return { app, chrome, cls: 's-dish' };
}

/* ================= Cart — the Taco Fiesta order ============================ */

function screenCart() {
  const r = restaurants.find((x) => x.id === 'rest-1');
  const dish = (id) => r.items.find((i) => i.id === id);

  const lines = [
    { d: dish('r1-pop-1'), qty: 2, note: 'extra consomé, no onions' },
    { d: dish('r1-taco-1'), qty: 3, note: '' },
    { d: dish('r1-pop-3'), qty: 1, note: '' },
  ];

  const units = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.d.priceMinor * l.qty, 0);
  const tax = Math.round(subtotal * 0.08625); /* San Francisco */
  const total = subtotal + r.deliveryFeeMinor + tax;

  const row = (l) => `
    <div class="line">
      <img src="${l.d.image}" alt="" />
      <div class="li">
        <h4>${l.d.name}</h4>
        ${l.note ? `<div class="instr">${l.note}</div>` : ''}
        <div class="price">
          ${money(l.d.priceMinor * l.qty)}
          ${l.qty > 1 ? `<span>${money(l.d.priceMinor)} each</span>` : ''}
        </div>
      </div>
      <div class="step"><b>&#8722;</b><i>${l.qty}</i><b>&#43;</b></div>
    </div>`;

  const app = `
    <div class="app s-cart">
      <div class="head">
        <div class="nav">
          <div class="back">&#8249;</div>
          <div class="ttl">
            <h1>Your cart</h1>
            <div class="from"><b>${r.name}</b> &middot; ${eta(r)}</div>
          </div>
          <div class="count">${units} items</div>
        </div>
      </div>

      <div class="lines">${lines.map(row).join('')}</div>

      <a class="addmore">
        <span class="lbl"><i class="pl">&#43;</i>Add more items</span>
        <span class="go">&#8250;</span>
      </a>

      <div class="sect"><h3>Delivery</h3></div>
      <div class="rows">
        <div class="drow">
          <div class="k">Address</div>
          <div class="v">124 Taco Lane<span>Mission District, San Francisco</span></div>
          <a class="chg">Change</a>
        </div>
        <div class="drow">
          <div class="k">Drop-off</div>
          <div class="v">Leave at door</div>
          <a class="chg">Change</a>
        </div>
        <div class="drow">
          <div class="k">Arrives</div>
          <div class="v">${eta(r)} after checkout</div>
        </div>
      </div>

      <div class="sect"><h3>Order summary</h3></div>
      <div class="sum">
        <div class="srow"><span>Subtotal</span><b>${money(subtotal)}</b></div>
        <div class="srow"><span>Delivery fee</span><b>${money(r.deliveryFeeMinor)}</b></div>
        <div class="srow"><span>Sales tax (8.625%)</span><b>${money(tax)}</b></div>
        <div class="srow tot"><span>Total</span><b>${money(total)}</b></div>
      </div>
      <div class="note">Taxes and fees estimated for San Francisco, CA. You are charged when the kitchen accepts the order.</div>
    </div>`;

  const chrome = `
    <div class="bar">
      <div class="cta">Go to checkout &middot; ${money(total)}</div>
    </div>`;

  return { app, chrome, cls: 's-cart' };
}

/* ================= Checkout — review before placing ======================== */

function screenCheckout() {
  const r = restaurants.find((x) => x.id === 'rest-1');
  const dish = (id) => r.items.find((i) => i.id === id);

  const lines = [
    { d: dish('r1-pop-1'), qty: 2, note: 'extra consomé, no onions' },
    { d: dish('r1-taco-1'), qty: 3, note: '' },
    { d: dish('r1-pop-3'), qty: 1, note: '' },
  ];

  const subtotal = lines.reduce((n, l) => n + l.d.priceMinor * l.qty, 0);
  const total = subtotal + r.deliveryFeeMinor;

  const line = (l) => `
    <div class="crow">
      <div class="ct">${l.qty} &times; ${l.d.name}</div>
      ${l.note ? `<div class="ci">${l.note}</div>` : ''}
      <div class="cp">${money(l.d.priceMinor * l.qty)}</div>
    </div>`;

  const app = `
    <div class="app s-checkout">
      <div class="head">
        <div class="back">&#8249;</div>
        <h1>Checkout</h1>
      </div>

      <div class="from">From <b>${r.name}</b></div>

      <div class="sect"><h3>Deliver to</h3></div>
      <div class="card tap">
        <span class="ic">&#8962;</span>
        <div class="t">
          <h4>Home</h4>
          <div class="s">124 Taco Lane, Mission District, 94110</div>
        </div>
        <span class="go">&#8250;</span>
      </div>

      <div class="sect"><h3>Payment</h3></div>
      <div class="card">
        <span class="ic">$</span>
        <div class="t"><h4>Cash on delivery</h4></div>
      </div>

      <div class="sect"><h3>Order summary</h3></div>
      <div class="lines">${lines.map(line).join('')}</div>
      <div class="sum">
        <div class="srow"><span>Subtotal</span><b>${money(subtotal)}</b></div>
        <div class="srow"><span>Delivery fee</span><b>${money(r.deliveryFeeMinor)}</b></div>
        <div class="srow tot"><span>Total</span><b>${money(total)}</b></div>
      </div>
    </div>`;

  const chrome = `
    <div class="bar">
      <div class="cta">Place order &middot; ${money(total)}</div>
    </div>`;

  return { app, chrome, cls: 's-checkout' };
}

/* ================= Order status ============================================
   Real order-seed-1 content (Taco Fiesta, real address/lines/total). Status
   is hardcoded to 'out_for_delivery' rather than the seed's 'delivered' so
   the timeline shows real mid-progress — the same "plausible current state"
   convention used for the deck position in variant M and the clock in K.
   ========================================================================= */

function screenOrder() {
  const o = window.FOODIO.orders.find((x) => x.id === 'order-seed-1');
  const status = 'out_for_delivery';

  const PROGRESSION = ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const LABEL = {
    placed: 'Order placed',
    accepted: 'Accepted by the kitchen',
    preparing: 'Preparing your food',
    ready: 'Ready for delivery',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
  };
  const reached = PROGRESSION.indexOf(status);

  const step = (s, i) => `
    <div class="tstep${i <= reached ? ' done' : ''}${i === reached ? ' cur' : ''}">
      <span class="dot">${i <= reached ? '&#10003;' : ''}</span>
      <span class="lb">${LABEL[s]}</span>
    </div>`;

  const line = (l, i) => `
    <div class="orow">
      <img src="${l.image}" alt="" />
      <div class="t">
        <h4>${l.name}</h4>
        <div class="s">${l.quantity} &times; ${money(l.unitPriceMinor)}</div>
      </div>
      <div class="p">${money(l.unitPriceMinor * l.quantity)}</div>
    </div>`;

  const app = `
    <div class="app s-order">
      <div class="head">
        <div class="back">&#8249;</div>
        <h1>Order</h1>
      </div>

      <div class="status">
        <h2>${LABEL[status]}</h2>
        <div class="from">From <b>${o.restaurantName}</b></div>
      </div>

      <div class="timeline">${PROGRESSION.map(step).join('')}</div>

      <div class="sect"><h3>Delivering to</h3></div>
      <div class="card">
        <span class="ic">&#8962;</span>
        <div class="t">
          <h4>${o.address.label}</h4>
          <div class="s">${o.address.line1}, ${o.address.city} ${o.address.postcode}</div>
        </div>
      </div>

      <div class="sect"><h3>Order summary</h3></div>
      <div class="lines">${o.lines.map(line).join('')}</div>
      <div class="sum">
        <div class="srow"><span>Subtotal</span><b>${money(o.subtotalMinor)}</b></div>
        <div class="srow"><span>Delivery fee</span><b>${money(o.deliveryFeeMinor)}</b></div>
        <div class="srow tot"><span>Total</span><b>${money(o.totalMinor)}</b></div>
      </div>

      <div class="ghost">Back to browsing</div>
    </div>`;

  const chrome = '';

  return { app, chrome, cls: 's-order' };
}

/* ---------------- switcher ---------------- */

const SCREENS = [
  ['Home', 'marketplace', screenHome],
  ['Restaurant', 'detail', screenRestaurant],
  ['Dish', 'detail', screenDish],
  ['Cart', 'checkout', screenCart],
  ['Checkout', 'review', screenCheckout],
  ['Order', 'status', screenOrder],
];

const screenEl = document.getElementById('screen');

function render() {
  const key = new URLSearchParams(location.search).get('screen') ?? 'Home';
  const i = Math.max(
    0,
    SCREENS.findIndex((sc) => sc[0].toLowerCase() === key.toLowerCase()),
  );
  const [name, sub, fn] = SCREENS[i];
  const { app, chrome, cls } = fn();

  screenEl.innerHTML = `${app}<div class="chrome ${cls}">${chrome}</div>`;
  document.getElementById('skey').textContent = name;
  document.getElementById('sname').textContent = sub;

  return i;
}

function go(step) {
  const i = render();
  const next = SCREENS[(i + step + SCREENS.length) % SCREENS.length][0];
  const url = new URL(location.href);
  url.searchParams.set('screen', next);
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
