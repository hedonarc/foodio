#!/usr/bin/env node
/**
 * Every remote URL in mocks/db.json is hot-linked from a third party that owes
 * us nothing. When one rots, expo-image shows its placeholder forever — which
 * looks exactly like a slow network, so it gets found by eye or not at all.
 *
 *   node scripts/check-db-urls.mjs
 */

import { readFile } from 'node:fs/promises';

const DB_PATH = new URL('../mocks/db.json', import.meta.url);
const CONCURRENCY = 8;
const TIMEOUT_MS = 15_000;

/** Every string that looks like a URL, with the path it sits at. */
function collectUrls(node, path = '$') {
  if (typeof node === 'string') {
    return node.startsWith('http') ? [{ url: node, path }] : [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child, index) => collectUrls(child, `${path}[${index}]`));
  }
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, child]) => collectUrls(child, `${path}.${key}`));
  }
  return [];
}

async function check({ url, path }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // HEAD first — some CDNs reject it, so fall back to a ranged GET rather
    // than downloading the whole asset.
    let response = await fetch(url, { method: 'HEAD', signal: controller.signal });
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        signal: controller.signal,
      });
    }
    return { url, path, status: response.status, ok: response.ok };
  } catch (error) {
    return { url, path, status: 0, ok: false, reason: String(error).split('\n')[0] };
  } finally {
    clearTimeout(timer);
  }
}

async function mapWithLimit(items, limit, worker) {
  const results = [];
  let cursor = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await worker(items[index]);
      }
    }),
  );

  return results;
}

const db = JSON.parse(await readFile(DB_PATH, 'utf8'));

// Distinct URLs, so one dead link shared by several records is fetched once.
const byUrl = new Map();
for (const entry of collectUrls(db)) {
  const paths = byUrl.get(entry.url);
  if (paths) paths.push(entry.path);
  else byUrl.set(entry.url, [entry.path]);
}

const targets = [...byUrl].map(([url, paths]) => ({ url, path: paths[0], paths }));
console.log(`Checking ${targets.length} distinct URLs from mocks/db.json…\n`);

const results = await mapWithLimit(targets, CONCURRENCY, check);
const broken = results.filter((result) => !result.ok);

for (const result of broken) {
  const { paths } = targets.find((target) => target.url === result.url);
  console.error(`${result.status || 'ERR'}  ${result.url}`);
  for (const path of paths) console.error(`      ${path}`);
  if (result.reason) console.error(`      ${result.reason}`);
}

const usages = targets.reduce((total, target) => total + target.paths.length, 0);

if (broken.length > 0) {
  console.error(`\n${broken.length} of ${targets.length} URLs are unreachable.`);
  process.exit(1);
}

console.log(`All ${targets.length} URLs reachable (${usages} usages).`);
