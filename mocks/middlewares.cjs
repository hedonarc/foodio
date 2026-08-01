/**
 * json-server middleware for the local mock API.
 *
 * CommonJS on purpose: package.json declares `"type": "module"`, so a `.js`
 * file here would be parsed as ESM and `module.exports` would throw.
 *
 * Latency comes from the CLI's `--delay`. This file exists for the thing the
 * CLI cannot do: make requests *fail*, so the app's error and retry paths are
 * exercised against a real HTTP response rather than only in theory.
 *
 *   MOCK_FAIL_RATE=0.3 pnpm api     # ~30% of reads fail with a 503
 *   curl -H 'x-mock-fail: 500' ...  # force one response to a given status
 */

const FAIL_RATE = Number.parseFloat(process.env.MOCK_FAIL_RATE ?? '0') || 0;

const MESSAGES = {
  400: 'Bad request.',
  401: 'Not authenticated.',
  404: 'Not found.',
  500: 'Something went wrong on our end.',
  503: 'The kitchen is temporarily unreachable.',
};

/** Error body shape — must match what the app's Axios client normalises. */
function errorBody(status) {
  return {
    error: {
      status,
      message: MESSAGES[status] ?? 'Request failed.',
    },
  };
}

module.exports = function chaos(req, res, next) {
  const forced = Number.parseInt(req.get('x-mock-fail') ?? '', 10);
  if (Number.isInteger(forced) && forced >= 400 && forced <= 599) {
    res.status(forced).jsonp(errorBody(forced));
    return;
  }

  // Only reads are sampled. Randomly losing a write would corrupt db.json,
  // and a mutation that half-succeeds is not a failure mode worth faking.
  if (FAIL_RATE > 0 && req.method === 'GET' && Math.random() < FAIL_RATE) {
    res.status(503).jsonp(errorBody(503));
    return;
  }

  next();
};
