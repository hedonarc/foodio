/**
 * json-server middleware for the local mock API.
 *
 * CommonJS on purpose: package.json declares `"type": "module"`, so a `.js`
 * file here would be parsed as ESM and `module.exports` would throw.
 *
 *   MOCK_FAIL_RATE=0.3 pnpm api     # ~30% of reads fail with a 503
 *   curl -H 'x-mock-fail: 500' ...  # force one response to a given status
 *
 * Sessions are theatre with one honest property: the server, not the client,
 * decides who the requester is. The token is a name badge — nothing hashes,
 * signs, expires or revokes it — but every scoped read resolves through it,
 * so swapping in real auth replaces this file and the picker, nothing else.
 */

const FAIL_RATE = Number.parseFloat(process.env.MOCK_FAIL_RATE ?? '0') || 0;

/**
 * Must match `--delay` in the `api` script. A middleware that responds here
 * never reaches json-server's delay, so without this every failure returns in
 * about a millisecond — and the failures are exactly the responses whose
 * loading states we most need to see.
 */
const DELAY_MS = Number.parseInt(process.env.MOCK_DELAY_MS ?? '400', 10) || 0;

/** Answers at the same speed json-server would, instead of instantly. */
function respondLater(res, status, body) {
  setTimeout(() => res.status(status).jsonp(body), DELAY_MS);
}

const MESSAGES = {
  400: 'Bad request.',
  401: 'Not authenticated.',
  403: 'You do not work here.',
  404: 'Not found.',
  409: 'This order has moved on. Pull to refresh.',
  500: 'Something went wrong on our end.',
  503: 'The kitchen is temporarily unreachable.',
};

function errorBody(status, message) {
  return { error: { status, message: message ?? MESSAGES[status] ?? 'Request failed.' } };
}

/**
 * A restaurant kitchen the client cannot see, so order status advances on the
 * server as it would in production rather than being faked in the app. Seconds
 * rather than minutes so the flow is watchable while developing.
 */
const TIMELINE = [
  { after: 0, status: 'placed' },
  { after: 20, status: 'accepted' },
  { after: 45, status: 'preparing' },
  { after: 90, status: 'ready' },
  { after: 120, status: 'out_for_delivery' },
  { after: 180, status: 'delivered' },
];

const SETTLED = new Set(['delivered', 'rejected', 'cancelled']);

function progressed(order) {
  if (!order || typeof order !== 'object' || !order.placedAt) return order;
  if (SETTLED.has(order.status)) return order;
  // Once staff have driven this order, the invisible kitchen lets go of it.
  if (order.statusLocked) return order;

  const elapsedSeconds = (Date.now() - Date.parse(order.placedAt)) / 1000;
  const reached = TIMELINE.filter((step) => elapsedSeconds >= step.after).pop();

  return reached ? { ...order, status: reached.status } : order;
}

/** `Bearer person:<id>` — deliberately readable, so nobody mistakes it for a credential. */
const TOKEN_PREFIX = 'person:';

function personIdFrom(req) {
  const header = req.get('authorization') ?? '';
  const raw = header.startsWith('Bearer ') ? header.slice(7) : '';
  return raw.startsWith(TOKEN_PREFIX) ? raw.slice(TOKEN_PREFIX.length) : null;
}

const findPerson = (req, id) =>
  (req.app.db.get('people').value() ?? []).find((person) => person.id === id) ?? null;

const AVAILABILITY_PATH = /^\/restaurants\/([^/]+)\/menu-items\/([^/]+)\/availability$/;
const ORDER_REVIEW_PATH = /^\/orders\/([^/]+)\/review$/;
const RESTAURANT_REVIEWS_PATH = /^\/restaurants\/([^/]+)\/reviews$/;
const RESTAURANT_ITEM_PATH = /^\/restaurants\/[^/]+$/;

/** Newest first — the sort the backend's reviews list and embed both use. */
const reviewsFor = (req, restaurantId) =>
  (req.app.db.get('reviews').value() ?? [])
    .filter((review) => review.restaurantId === restaurantId)
    .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));

const REVIEWS_PAGE_SIZE = 5;
const EMBEDDED_REVIEWS = 5;

const isOrdersRead = (req) => req.method === 'GET' && req.path.startsWith('/orders');
const isOrderItem = (req) => /^\/orders\/[^/]+$/.test(req.path);
const isOrderCreate = (req) => req.method === 'POST' && req.path.startsWith('/orders');
const isOrderPatch = (req) => req.method === 'PATCH' && isOrderItem(req);

/** Mirror of the backend's `order-status.ts` TRANSITIONS. */
const TRANSITIONS = {
  placed: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['out_for_delivery'],
  out_for_delivery: ['delivered', 'delivery_failed'],
  delivered: [],
  delivery_failed: [],
  rejected: [],
  cancelled: [],
};

module.exports = function mockApi(req, res, next) {
  // A session is issued, never verified — but it is issued by the server.
  if (req.method === 'POST' && req.path === '/sessions') {
    const person = findPerson(req, req.body?.personId);
    if (!person) {
      respondLater(res, 404, errorBody(404));
      return;
    }
    respondLater(res, 201, { token: TOKEN_PREFIX + person.id, person });
    return;
  }

  const forced = Number.parseInt(req.get('x-mock-fail') ?? '', 10);
  if (Number.isInteger(forced) && forced >= 400 && forced <= 599) {
    respondLater(res, forced, errorBody(forced));
    return;
  }

  // Only reads are sampled. Randomly losing a write would corrupt db.json.
  if (FAIL_RATE > 0 && req.method === 'GET' && Math.random() < FAIL_RATE) {
    respondLater(res, 503, errorBody(503));
    return;
  }

  // "Sold out", said in one request. Mirrors the backend's tenant scope
  // exactly: authenticated + entitled at this restaurant, no capability
  // narrowing — `setAvailability` calls `narrowToRestaurant`, nothing more.
  const availability = req.method === 'PATCH' ? AVAILABILITY_PATH.exec(req.path) : null;
  if (availability) {
    const [, restaurantId, itemId] = availability;

    const personId = personIdFrom(req);
    if (!personId) {
      respondLater(res, 401, errorBody(401));
      return;
    }

    const person = findPerson(req, personId);
    const entitled = (person?.entitlements ?? []).some((e) => e.restaurantId === restaurantId);
    if (!entitled) {
      respondLater(res, 403, errorBody(403));
      return;
    }

    if (typeof req.body?.isAvailable !== 'boolean') {
      respondLater(res, 400, errorBody(400));
      return;
    }

    const items = req.app.db.get('menuItems');
    if (!items.find({ id: itemId, restaurantId }).value()) {
      respondLater(res, 404, errorBody(404));
      return;
    }

    // `.write()` resolves async; the in-memory value is already updated.
    void items.find({ id: itemId }).assign({ isAvailable: req.body.isAvailable }).write();
    respondLater(res, 200, items.find({ id: itemId }).value());
    return;
  }

  // Every review the restaurant has, a page at a time. The cursor is the id
  // of the last row served — opaque to the client, carried forward verbatim.
  const reviewsRead = req.method === 'GET' ? RESTAURANT_REVIEWS_PATH.exec(req.path) : null;
  if (reviewsRead) {
    const all = reviewsFor(req, reviewsRead[1]);
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : '';
    const after = cursor ? all.findIndex((review) => review.id === cursor) : -1;
    const start = after >= 0 ? after + 1 : 0;
    const page = all.slice(start, start + REVIEWS_PAGE_SIZE);
    const last = page[page.length - 1];

    if (last && start + page.length < all.length) {
      res.set('Access-Control-Expose-Headers', 'X-Next-Cursor');
      res.set('X-Next-Cursor', last.id);
    }
    respondLater(res, 200, page);
    return;
  }

  // The detail's embedded reviews[] are the newest few real ones — served from
  // the reviews collection, exactly as the backend serves them from its table.
  if (req.method === 'GET' && RESTAURANT_ITEM_PATH.test(req.path)) {
    const send = res.jsonp.bind(res);
    res.jsonp = (body) =>
      send(
        body && body.id
          ? { ...body, reviews: reviewsFor(req, body.id).slice(0, EMBEDDED_REVIEWS) }
          : body,
      );
  }

  // A delivered order earns the right to speak — once. Mirrors the backend:
  // 403 on someone else's order, 409 undelivered, 409 already reviewed, and
  // the rating aggregate moves in the same write.
  const reviewCreate = req.method === 'POST' ? ORDER_REVIEW_PATH.exec(req.path) : null;
  if (reviewCreate) {
    const personId = personIdFrom(req);
    if (!personId) {
      respondLater(res, 401, errorBody(401));
      return;
    }

    const orderId = reviewCreate[1];
    const order = req.app.db.get('orders').find({ id: orderId }).value();
    if (!order) {
      respondLater(res, 404, errorBody(404));
      return;
    }
    if (order.customerId !== personId) {
      respondLater(res, 403, errorBody(403, 'That is not your order.'));
      return;
    }
    if (progressed(order).status !== 'delivered') {
      respondLater(res, 409, errorBody(409, 'Only a delivered order can be reviewed.'));
      return;
    }

    const reviews = req.app.db.get('reviews');
    if (reviews.find({ orderId }).value()) {
      respondLater(res, 409, errorBody(409, 'You have already reviewed this order.'));
      return;
    }

    const rating = req.body?.rating;
    const comment = req.body?.comment ?? '';
    const validRating = Number.isInteger(rating) && rating >= 1 && rating <= 5;
    if (!validRating || typeof comment !== 'string' || comment.length > 1000) {
      respondLater(res, 400, errorBody(400));
      return;
    }

    const person = findPerson(req, personId);
    const review = {
      id: `rev-${orderId}`,
      author: person?.displayName ?? 'Customer',
      avatar: '',
      rating,
      comment,
      postedAt: new Date().toISOString(),
      restaurantId: order.restaurantId,
      orderId,
    };
    void reviews.push(review).write();

    // The aggregate moves with the row — the discovery list never recomputes it.
    const restaurants = req.app.db.get('restaurants');
    const restaurant = restaurants.find({ id: order.restaurantId }).value();
    if (restaurant) {
      const reviewCount = restaurant.reviewCount + 1;
      const nextRating =
        Math.round(((restaurant.rating * restaurant.reviewCount + rating) / reviewCount) * 10) / 10;
      void restaurants
        .find({ id: order.restaurantId })
        .assign({ rating: nextRating, reviewCount })
        .write();
    }

    respondLater(res, 201, review);
    return;
  }

  if (isOrdersRead(req)) {
    const personId = personIdFrom(req);
    if (!personId) {
      respondLater(res, 401, errorBody(401));
      return;
    }

    // Staff read a Restaurant's orders; customers read their own. The scope
    // comes from the token's entitlements, never from a client-supplied param.
    const asRestaurant = req.query.forRestaurantId;
    const person = findPerson(req, personId);
    const entitled =
      asRestaurant && (person?.entitlements ?? []).some((e) => e.restaurantId === asRestaurant);

    if (asRestaurant && !entitled) {
      respondLater(res, 403, errorBody(403));
      return;
    }

    if (!isOrderItem(req)) {
      delete req.query.forRestaurantId;
      if (entitled) req.query.restaurantId = asRestaurant;
      else req.query.customerId = personId;
    }

    // Staff see the customer's phone, so a rider can call about a wrong gate
    // number. Customers reading their own orders never get this field.
    const phoneOf = (order) =>
      entitled ? (findPerson(req, order.customerId)?.phone ?? undefined) : undefined;
    const serve = (order) => {
      const shaped = progressed(order);
      const phone = shaped && phoneOf(shaped);
      return phone ? { ...shaped, customerPhone: phone } : shaped;
    };

    const send = res.jsonp.bind(res);
    res.jsonp = (body) => {
      // Someone else's order is a 404, not an empty 200 the client must interpret.
      if (isOrderItem(req) && body && body.customerId && body.customerId !== personId) {
        res.status(404);
        return send(errorBody(404));
      }
      return send(Array.isArray(body) ? body.map(serve) : serve(body));
    };
  }

  // Legality lives server-side, exactly like the real backend: an illegal
  // transition is a 409, and a staff-driven order stops auto-progressing.
  if (isOrderPatch(req) && req.body && typeof req.body === 'object' && req.body.status) {
    const orderId = req.path.split('/')[2];
    const stored = req.app.db.get('orders').find({ id: orderId }).value();

    if (stored) {
      const current = progressed(stored).status;
      const to = req.body.status;
      if (current !== to && !(TRANSITIONS[current] ?? []).includes(to)) {
        respondLater(res, 409, errorBody(409));
        return;
      }
      req.body.statusLocked = true;
    }
  }

  // The server owns status, placedAt and whose order it is.
  if (isOrderCreate(req) && req.body && typeof req.body === 'object') {
    const personId = personIdFrom(req);
    if (!personId) {
      respondLater(res, 401, errorBody(401));
      return;
    }
    req.body.customerId = personId;
    req.body.status = 'placed';
    req.body.placedAt = new Date().toISOString();
  }

  next();
};
