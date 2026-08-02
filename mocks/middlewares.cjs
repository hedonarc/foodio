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
  404: 'Not found.',
  500: 'Something went wrong on our end.',
  503: 'The kitchen is temporarily unreachable.',
};

function errorBody(status) {
  return { error: { status, message: MESSAGES[status] ?? 'Request failed.' } };
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

const isOrdersRead = (req) => req.method === 'GET' && req.path.startsWith('/orders');
const isOrderItem = (req) => /^\/orders\/[^/]+$/.test(req.path);
const isOrderCreate = (req) => req.method === 'POST' && req.path.startsWith('/orders');

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

  if (isOrdersRead(req)) {
    const personId = personIdFrom(req);
    if (!personId) {
      respondLater(res, 401, errorBody(401));
      return;
    }

    // Scope the collection before the router, so X-Total-Count stays honest.
    if (!isOrderItem(req)) req.query.customerId = personId;

    const send = res.jsonp.bind(res);
    res.jsonp = (body) => {
      // Someone else's order is a 404, not an empty 200 the client must interpret.
      if (isOrderItem(req) && body && body.customerId && body.customerId !== personId) {
        res.status(404);
        return send(errorBody(404));
      }
      return send(Array.isArray(body) ? body.map(progressed) : progressed(body));
    };
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
