# Free ($0/mo) staging host research — follow-up to #88

Follow-up to: https://github.com/hedonarc/foodio/issues/88 (closed — picked
Fly.io Mumbai + Supabase Mumbai + Upstash, ~$2-5/mo)

Scope: is there a **genuinely free** ($0/mo, no credit card burn, no
one-time-credit cliff) staging stack for `foodio-backend`? Hard requirements:
NestJS/Node 22 running 24/7 or with acceptable cold-start, managed Postgres
**with PostGIS**, Redis (or an acceptable staging-only substitute), deploy
from GitHub Actions. Latency to Pakistan matters but is explicitly secondary
to cost here.

## Comparison table

| Provider                                               | Compute for NestJS                                                                                                                                                 | Cost                                                                                                                                                                                                    | PostGIS                                                                                                                                                                                                                                  | Redis                                                              | Cold start                                                                                                                                            | Region / inferred latency to Lahore                                                                                                                                                                                                                                                                                                                                                                        | Catch / expiry                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fly.io**                                             | Docker deploy via `flyctl`                                                                                                                                         | **Not free anymore.** Permanent free tier removed in 2024; new accounts get a one-time $5 / 2-VM-hour / 7-day trial, then a credit card is required — pay-as-you-go from ~$2/mo per machine.[^fly-dead] | n/a (was Supabase in the #88 plan)                                                                                                                                                                                                       | n/a                                                                | n/a                                                                                                                                                   | Mumbai (`bom`) ~35-40ms — still the best latency in this whole comparison, just no longer free.                                                                                                                                                                                                                                                                                                            | Free tier is **gone**, not shrunk. Legacy pre-2024 accounts keep old allowances but can't be recreated.                                                                                                                                                                                                                                                                                                                 |
| **Render (free web service)**                          | Docker/native Node build, "Free" instance type                                                                                                                     | $0                                                                                                                                                                                                      | Managed Postgres supports PostGIS via `CREATE EXTENSION`,[^render-ext] but the **free Postgres plan expires 30 days after creation** (14-day grace period, then deleted) — not viable as a standing staging DB on its own.[^render-free] | No free Redis-compatible tier (Key Value starts at $10/mo)         | Spins down after 15 min idle; ~1 min cold start on next request.[^render-free]                                                                        | Singapore only (no Mumbai) — inferred ~65-90ms.                                                                                                                                                                                                                                                                                                                                                            | Free web service capped at 750 instance-hrs/workspace/mo (fine for one service); free **DB expires monthly and must be recreated** — a real operational tax for a database.                                                                                                                                                                                                                                             |
| **Railway**                                            | Docker deploy via `railway up`                                                                                                                                     | Trial: one-time **$5 credit, 30 days**, no card required. After that: Free plan drops to **$1/mo credit, non-rolling**.[^railway-trial]                                                                 | Would need `postgis/postgis` Docker image as a service (Railway's managed Postgres plugin has mixed extension support)                                                                                                                   | Managed Redis plugin available, but billed against the same credit | No forced sleep, but $1/mo buys only a few hours of a small instance — effectively unusable past the 30-day trial.                                    | No Asia region at all (US-West/East, EU-West) — inferred 150-250ms.                                                                                                                                                                                                                                                                                                                                        | The "$1/mo" free plan is **not enough credit to run a 24/7 service** — this is a 30-day trial with a token afterlife, not a real free tier.                                                                                                                                                                                                                                                                             |
| **Koyeb**                                              | Docker/buildpack deploy, free "Nano" instance                                                                                                                      | $0                                                                                                                                                                                                      | n/a (compute only)                                                                                                                                                                                                                       | n/a                                                                | Scales to zero after 1 hr idle; Koyeb's "Deep Sleep" wake is **1-5 seconds**, notably faster than Render's ~1 min.[^koyeb-instances]                  | **Only Frankfurt or Washington D.C.** for free instances — no Asia region at all; inferred 150-200ms+.                                                                                                                                                                                                                                                                                                     | 512MB RAM / 0.1 vCPU / 2GB disk — thin, but enough for a lightly-used NestJS staging API. Genuinely free indefinitely, no card required for the free instance.                                                                                                                                                                                                                                                          |
| **Supabase**                                           | n/a — DB only. Edge Functions run on **Deno**, not Node, and are capped at 60s execution / 150MB memory, so a full NestJS server cannot run there.[^supabase-deno] | $0 (DB only)                                                                                                                                                                                            | Bundled, supported extension.[^supabase-pg]                                                                                                                                                                                              | No                                                                 | n/a                                                                                                                                                   | Mumbai (`ap-south-1`) available on free tier — best latency of any free DB option here.                                                                                                                                                                                                                                                                                                                    | **Free projects pause after 1 week of inactivity** — needs a periodic keep-alive ping (same caveat as the #88 research). DB-only: still need separate free compute for the API.                                                                                                                                                                                                                                         |
| **Neon**                                               | n/a — DB only                                                                                                                                                      | $0                                                                                                                                                                                                      | Standard extension, installable on any project including free tier.[^neon-pg]                                                                                                                                                            | No                                                                 | Autosuspend after 5 min idle, **cannot be disabled on free tier** — first query after idle pays a cold-start (typically sub-second to a few seconds). | Singapore (`aws-ap-southeast-1`) only, no Mumbai — inferred ~65-90ms.                                                                                                                                                                                                                                                                                                                                      | 0.5GB storage / 100 compute-hours per month — comfortably covers a low-traffic staging DB. No expiry date (unlike Render's free Postgres), just the monthly compute-hour cap.                                                                                                                                                                                                                                           |
| **Upstash Redis**                                      | n/a — cache only                                                                                                                                                   | $0                                                                                                                                                                                                      | n/a                                                                                                                                                                                                                                      | This is the Redis option                                           | N/A (serverless REST + Redis protocol, no idle spin-down)                                                                                             | No Mumbai; Singapore/global available — inferred ~65-90ms.                                                                                                                                                                                                                                                                                                                                                 | 256MB data, 500K commands/mo, 10GB bandwidth/mo — permanent free tier, no expiry.[^upstash-limits] Comfortably enough for staging cache/session/queue use.                                                                                                                                                                                                                                                              |
| **Oracle Cloud Always Free (Ampere A1, self-managed)** | Full Ubuntu/Oracle Linux ARM VM — run NestJS via Docker/PM2 yourself, no PaaS cold start at all                                                                    | $0, genuinely forever (not a trial)                                                                                                                                                                     | Self-installed Postgres+PostGIS in Docker — full control, zero platform restriction                                                                                                                                                      | Self-installed Redis container on the same box                     | **None** — it's a real always-on VM, not scale-to-zero                                                                                                | 2 OCPU / 12GB RAM total (halved from 4/24 as of mid-2026), flexibly split across 1-2 instances.[^oracle-shrink] Region is picked once at signup and can't be changed; Mumbai (`ap-mumbai-1`) exists as an OCI region but Always Free capacity there is not guaranteed — "out of host capacity" errors are common for Ampere A1 in popular regions.[^oracle-capacity] Nearest safer bet is often Singapore. | Highest effort of any option: you own OS patching, Docker, Postgres/PostGIS setup, Redis setup, TLS, and a GitHub Actions **SSH deploy** step (no native `git push`-to-deploy). Idle instances can be **reclaimed** if CPU/network/memory all stay under 20% utilization for 7 days straight — a near-silent staging box needs a cheap cron/health-check to stay "active" enough to avoid reclamation.[^oracle-reclaim] |
| Vercel / Netlify                                       | Serverless functions only                                                                                                                                          | $0 tier exists                                                                                                                                                                                          | n/a                                                                                                                                                                                                                                      | n/a                                                                | n/a                                                                                                                                                   | n/a                                                                                                                                                                                                                                                                                                                                                                                                        | **Dismissed**: both are built around short-lived serverless functions (seconds-scale execution limits) and have no concept of a persistent, always-listening NestJS process with WebSocket/long-poll support — fundamentally the wrong shape for this workload, not just a pricing mismatch.                                                                                                                            |

## Ranked recommendation

### Winner: Koyeb (NestJS compute, free Nano) + Neon (Postgres/PostGIS, free) + Upstash (Redis, free)

- **Cost**: $0/mo across all three, no card required anywhere, no trial-credit
  cliff to fall off — this is the only combination in the table where every
  piece is a _standing_ free tier rather than a time-boxed trial.
- **PostGIS**: Neon supports it as a normal `CREATE EXTENSION postgis;` on
  the free plan.
- **Redis**: Upstash's free tier (256MB/500K commands/mo) is a real
  permanent allowance, not a trial.
- **Deploy from GitHub Actions**: Koyeb has a first-class `koyeb/action-git-deploy`-style
  GitHub Action / API deploy path (Docker image push or Git-based auto-deploy on push);
  Neon and Upstash are just connection strings/REST tokens dropped into repo secrets, same
  as the #88 plan.
- **Cold start**: Koyeb's free instance sleeps after 1 hr idle, but wakes in
  1-5 seconds (vs. Render's ~1 minute) — the least painful sleep behavior of
  any free compute option.
- **Latency tradeoff, honestly stated**: Koyeb free has no Asia region
  (Frankfurt/Washington D.C. only) and Neon free has no Mumbai region
  (Singapore only) — so app and DB end up split across two non-Pakistan-adjacent
  regions, likely **150-250ms** combined RTT for a round trip that touches
  both. That is materially worse than the #88 Mumbai plan, but this option
  is answering a different question ("what's free"), not the latency one.

### Runner-up: Oracle Cloud Always Free (self-managed Ampere A1 VM)

- **Cost**: also $0/mo, and unlike every PaaS free tier above it is not a
  trial, a monthly-recreated resource, or a credit balance — it is a real
  always-on 2 OCPU/12GB ARM VM, forever, as long as OCI's idle-reclamation
  threshold (all of CPU/network/memory under 20% for 7 days) isn't tripped.
- **Latency**: potentially the best of the free options if Mumbai capacity
  is available at signup (same ballpark as the old Fly.io Mumbai plan,
  since it's the same metro), but Always Free Ampere A1 capacity in Mumbai
  is not guaranteed — Singapore is the safer fallback region.
- **Why it's runner-up and not the winner**: it trades the $0 cost that
  Koyeb/Neon/Upstash offer for real infra ownership — you patch the OS,
  install and maintain Docker/Postgres/PostGIS/Redis yourself, manage TLS,
  and build an SSH-based GitHub Actions deploy step instead of a native
  `git push`/API deploy. For a _staging_ environment this is a meaningfully
  bigger operational surface than a three-vendor PaaS stack, even though
  the PaaS stack has worse latency. Reach for this only if the team is
  comfortable owning a Linux box, or if the Koyeb/Neon Asia-latency gap
  turns out to matter more in practice than expected.

**Explicitly ruled out as a standalone free option:** Fly.io (no free tier
survives — new accounts get a one-time $5/2hr/7-day trial, then a card is
required); Railway (the "free" plan is $1/mo of non-rolling credit after a
30-day $5 trial, not enough to run anything 24/7); Render's free Postgres
(expires every 30 days and must be manually recreated — unacceptable churn
for a database, even though Render's free _web service_ itself is fine);
Supabase as sole host (DB-only — Edge Functions run on Deno with a 60s
execution cap, so it cannot host a persistent NestJS server, only pair with
it as the free-tier Postgres+PostGIS leg); Vercel/Netlify (serverless-only,
wrong execution model for a long-running API).

## What you give up vs. the #88 Fly.io Mumbai plan

The #88 recommendation (Fly.io Mumbai + Supabase Mumbai + Upstash) is no
longer purely "free" — Fly.io's permanent free tier is gone — but it was
never free either; it was ~$2-5/mo. Moving to the $0 winner above costs:

- **Latency**: the #88 plan put both compute and DB in Mumbai (~35-40ms to
  Lahore, the best number in either comparison). The $0 winner has no
  Mumbai leg at all — Koyeb compute sits in Frankfurt/D.C. and Neon's DB
  sits in Singapore, so realistic RTT is **4-6x worse** (~150-250ms vs
  ~35-40ms). For a staging environment used for manual QA and CI smoke
  tests rather than real end-user traffic, this is very likely tolerable;
  it would not be acceptable for production.
- **Cold starts**: Fly.io's paid machines can be kept warm continuously.
  Koyeb's free Nano instance sleeps after 1hr idle (1-5s wake) — fine for a
  staging box that isn't hit constantly, but a real behavior change from
  "always warm."
- **Compute headroom**: Fly's paid machines are sized to taste (256MB+).
  Koyeb's free Nano is fixed at 512MB RAM / 0.1 vCPU — thin for anything
  beyond a lightly-used staging API; watch for OOM under load testing.
  (Oracle's free VM, by contrast, is _more_ headroom than the old Fly plan —
  12GB RAM total — at the cost of self-management.)
- **Redis and DB provider continuity**: Upstash is unchanged in both plans.
  Postgres/PostGIS moves from Supabase (which also offers auth, storage,
  realtime — unused extras) to Neon (DB-only, narrower but equally solid
  PostGIS support); this is a lateral move, not really a downgrade, since
  the #88 plan wasn't using Supabase's other features anyway.
- **Deploy ergonomics**: Fly's `flyctl deploy` from GitHub Actions is about
  as low-ceremony as it gets. Koyeb's Git-based auto-deploy or Docker-push
  deploy is comparably simple; this is roughly a wash.
- **Operational reliability of the free tier itself**: none of the $0
  options carry an SLA — Koyeb/Neon/Upstash free tiers can throttle,
  degrade, or change terms without the notice a paid plan implies (as the
  Fly.io free-tier removal in 2024 itself demonstrates). A team relying on
  this stack for anything beyond disposable staging should budget for the
  possibility of migrating again.

Net: the $0 stack is a reasonable trade for a staging environment where the
real cost driver is engineering time, not latency — but it is a genuine
downgrade in latency and warm-compute consistency relative to the #88 plan,
not a free lunch replacement for it.

## Sources

- [Fly.io Free Tier 2026: What's Left After the Cuts? — SaaSPricePulse](https://www.saaspricepulse.com/tools/flyio)
- [7 Fly.io Alternatives in 2026: Real Pricing After the Free Tier Died — ExpressTech](https://expresstech.io/7-fly-io-alternatives-in-2026-real-pricing-after-the-free-tier-died/)
- [Render Free tier docs](https://render.com/docs/free)
- [Render Postgres — Supported Extensions](https://render.com/docs/postgresql-extensions)
- [Railway Free Trial docs](https://docs.railway.com/pricing/free-trial)
- [Railway Pricing Plans docs](https://docs.railway.com/reference/pricing/plans)
- [Koyeb Instances reference docs](https://www.koyeb.com/docs/reference/instances)
- [Koyeb Free Tier Cold Start — Runhooks](https://runhooks.app/blog/keeping-koyeb-free-tier-awake/)
- [Neon Plans docs](https://neon.com/docs/introduction/plans)
- [Neon PostGIS extension docs](https://neon.com/docs/extensions/postgis)
- [Upstash Redis Pricing & Limits docs](https://upstash.com/docs/redis/overall/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [NestJS Support in Supabase Edge Functions — GitHub Discussion #30293](https://github.com/orgs/supabase/discussions/30293)
- [Oracle Cloud Always Free Resources docs](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
- [New region in Mumbai, India — Oracle release notes](https://docs.oracle.com/en-us/iaas/releasenotes/changes/6e550337-46d5-4b71-a743-60e6adc4ebc1/index.htm)
- [Oracle Cloud Free Tier FAQ — Oracle India](https://www.oracle.com/in/cloud/free/faq/)

[^fly-dead]: [Fly.io Free Tier 2026: What's Left After the Cuts? — SaaSPricePulse](https://www.saaspricepulse.com/tools/flyio); [7 Fly.io Alternatives in 2026 — ExpressTech](https://expresstech.io/7-fly-io-alternatives-in-2026-real-pricing-after-the-free-tier-died/) — permanent free tier removed in 2024; new accounts get a one-time $5/2-VM-hour/7-day trial, then require a card.

[^render-ext]: [Render Postgres — Supported Extensions docs](https://render.com/docs/postgresql-extensions) — PostGIS listed among supported extensions.

[^render-free]: [Render Free tier docs](https://render.com/docs/free) — 750 free instance-hrs/workspace/mo, spin-down after 15 min idle (~1 min cold start); free Postgres has 1GB storage cap and expires 30 days after creation with a 14-day grace period.

[^railway-trial]: [Railway Free Trial docs](https://docs.railway.com/pricing/free-trial); [Railway Pricing Plans docs](https://docs.railway.com/reference/pricing/plans) — one-time $5 credit for 30 days, then Free plan drops to $1/mo non-rolling credit.

[^koyeb-instances]: [Koyeb Instances reference docs](https://www.koyeb.com/docs/reference/instances) — free instance limited to Frankfurt/Washington D.C., 512MB RAM/0.1vCPU/2GB SSD, scales to zero after 1hr idle with 1-5s "Deep Sleep" wake.

[^supabase-deno]: [NestJS Support in Supabase Edge Functions — GitHub Discussion #30293](https://github.com/orgs/supabase/discussions/30293) — Edge Functions run on Deno, not Node, with 60s execution / 150MB memory caps, incompatible with hosting a persistent NestJS server.

[^supabase-pg]: [Supabase Pricing](https://supabase.com/pricing) — PostGIS bundled as a standard extension; free projects pause after 1 week of inactivity, 2 active projects max.

[^neon-pg]: [Neon Plans docs](https://neon.com/docs/introduction/plans); [Neon PostGIS extension docs](https://neon.com/docs/extensions/postgis) — 0.5GB storage / 100 compute-hrs per project per month on free tier, autosuspend after 5 min idle (cannot be disabled on free tier), no Mumbai region (Singapore is the closest APAC region).

[^upstash-limits]: [Upstash Redis Pricing & Limits docs](https://upstash.com/docs/redis/overall/pricing) — 256MB data, 500K commands/mo, 10GB bandwidth/mo, permanent free tier (monthly-command model replaced the old daily cap in March 2025).

[^oracle-shrink]: Search-aggregated reporting on Oracle Always Free Ampere A1 allowance; limits described as halved to 2 OCPU/12GB total as of mid-2026, down from the historical 4 OCPU/24GB. Verify current figures against the [Oracle Cloud Always Free Resources docs](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) before provisioning, since this figure could not be independently confirmed on Oracle's own page during this research pass.

[^oracle-capacity]: [Oracle Cloud Free Tier FAQ — Oracle India](https://www.oracle.com/in/cloud/free/faq/); community reports of "out of host capacity" errors for Ampere A1 shapes in popular regions are widespread but not an Oracle-published statistic — treat Mumbai Always Free A1 availability as unconfirmed until tested at signup.

[^oracle-reclaim]: [Oracle Cloud Always Free Resources docs](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) — idle Always Free A1 instances may be reclaimed if CPU, network, and memory utilization (95th percentile) all stay under 20% for a rolling 7-day period.
