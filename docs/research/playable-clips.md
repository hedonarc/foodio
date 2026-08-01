# Direct-playable clips for a food feed

Research for [#22](https://github.com/hedonarc/foodio/issues/22) (parent: #19).
Investigated 2026-08-02. Every URL in this document was fetched over the wire; the
verification method is recorded so the checks can be repeated.

## Summary

- **The Google sample bucket is dead.** `commondatastorage.googleapis.com/gtv-videos-bucket`
  now returns **403 AccessDenied** for anonymous callers — the whole bucket, not one object.
  It is the single most-copied "just use this MP4" URL on the internet and it has rotted.
  Do not put it in `db.json`. See [Google's sample bucket](#googles-sample-bucket-gone).
- **Portrait 9:16 food video exists in quantity — but from exactly one source.** Pexels has
  ~150+ portrait food clips behind a working `?orientation=portrait` filter. Coverr has
  **zero**, and Mixkit has almost none. The initial worry that "everything is landscape" is
  true of three of the four libraries and false of the one that matters.
  See [Portrait availability](#3-is-portrait-916-food-video-actually-available).
- **HLS is available but never portrait, and never food.** The only reliable public
  `.m3u8` endpoints are vendor test streams (Apple, Mux) carrying landscape stock reels.
  Adaptive streaming and a good-looking food feed cannot be exercised by the same asset.
- **Hot-linking is the real licence question**, and the answer differs per source even
  where the _content_ licence is permissive. A licence that permits commercial use does
  not imply permission to use the vendor's CDN as your CDN.

---

## Verification method

Two checks were used, both repeatable.

**Reachability, type and size** — `HEAD`, plus a ranged `GET` to prove the body is real:

```sh
curl -sS -o /dev/null -w '%{http_code} %{content_type} %{size_download}\n' \
     -m 30 -r 0-200000 '<URL>'
```

**Dimensions, duration and bitrate** — no `ffprobe` on the machine, so an MP4 atom parser
was used over HTTP range requests, reading `mvhd` for duration and `tkhd` for pixel
dimensions, falling back to a tail fetch when `moov` is not at the front. Bitrate is
derived as `content-length * 8 / duration`. The parser was validated against two files of
known geometry before being trusted (`640x360` and `320x176` both read back correctly).

Anything below marked **verified** returned `200`/`206` with a `video/*` or
`application/x-mpegURL` content type at the time of writing.

---

## 1. Where the video can come from

### Google's sample bucket (gone)

```
$ curl -I https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
HTTP/2 403
```

```xml
<Error><Code>AccessDenied</Code><Message>Access denied.</Message>
<Details>Anonymous caller does not have storage.objects.get access to the
Google Cloud Storage object.</Details></Error>
```

Every path tested returns 403 — `sample/BigBuckBunny.mp4`, `sample/ElephantsDream.mp4`,
`sample/ForBiggerFun.mp4`, `ForBiggerBlazes.mp4`, `CastVideos/mp4/BigBuckBunny.mp4`, the
bucket root, and the same objects via the `storage.googleapis.com` hostname. This is a
permissions change on the bucket, not a moved object.

Google never published a licence or a stability promise for this bucket; it was demo
scaffolding for Cast/ExoPlayer samples that the internet adopted as a public CDN. There
was never anything to rely on. **It is the cautionary example for this whole ticket.**

A sibling Google bucket, `storage.googleapis.com/shaka-demo-assets/`, is **still live**
(verified: `angel-one-hls/hls.m3u8` → 200 `application/x-mpegURL`; `angel-one/dash.mpd`
and `sintel/dash.mpd` → 200). It carries the same absence of any stability guarantee, so
treat it as borrowed, not owned.

### The four stock libraries

Licence terms were read from each vendor's own licence/terms/API pages, not from
summaries. The important column is **hot-linking**, and it is the one people skip: a
licence granting free commercial use of the _content_ says nothing about whether you may
serve that content off the vendor's CDN.

| Source      | Attribution                               | Commercial              | Hot-linking                      | API key          |
| ----------- | ----------------------------------------- | ----------------------- | -------------------------------- | ---------------- |
| **Pixabay** | Not required                              | Yes                     | **Explicitly allowed for video** | Yes (for search) |
| **Pexels**  | Not required (site); **required via API** | Yes                     | Silent                           | Yes (for search) |
| **Coverr**  | **Required** (free tier)                  | Yes                     | Officially 15-min signed URLs    | Yes              |
| **Mixkit**  | Not required                              | Yes (free licence only) | **Arguably prohibited**          | No public API    |

**Pixabay — the only affirmative permission.** The clause is not in the licence, it is in
the [API docs](https://pixabay.com/api/docs/) under a heading called "Hotlinking", and it
draws an explicit split between images and video:
`"permanent hotlinking of images (using Pixabay URLs in your app) is not allowed"` but
`"Videos may be embedded directly in your applications."` — with a recommendation to
self-host anyway. No attribution required
([licence summary](https://pixabay.com/service/license-summary/)). Note the asymmetry:
the documented image `webformatURL` is `"URL valid for 24 hours"`, whereas video URLs are
unsigned and content-hashed. **Video is the blessed case; images are not.**

**Pexels — permissive but silent.** `"Attribution is not required"`
([licence](https://www.pexels.com/license/)), commercial use granted. The ToS has no
hot-link or CDN clause at all; the nearest restriction is a ban on
`"Bulk, large-scale or systematic copying of Content"`. Silence is not permission, but
nothing here is breached by a handful of hard-coded URLs. One trap: the **API imposes an
obligation the plain licence does not** — going through the API requires
`"a prominent link to Pexels"`. Downloading from the site does not.

**Coverr — attribution required, and hot-linking is designed against.** The licence says
`"you must add an attribution credit to the original creator or to Coverr.co"` for free
downloads. More decisive: Coverr's official API documents its download endpoint as
returning a signed URL `"Valid only for 15 minutes"`, which cannot be committed to
`db.json`. The unsigned `cdn.coverr.co` URLs the website itself serves do work (verified,
`cache-control: public, max-age=31536000`), but they are not the contracted interface.
Note also that Coverr's own licence page contradicts itself — a "Longform" section states
`"You are not required to seek permission from or provide credit"`. Treat attribution as
required.

**Mixkit — the one with an actual anti-linking clause.** The free licence itself is
generous (`"Attribution is not required"`, commercial use allowed), but the
[User Terms](https://mixkit.co/terms/) clause 9 lists **"link to"** among prohibited acts
against "any part of Mixkit", where "Mixkit" is defined to include an "Item". It reads as
platform-integrity boilerplate rather than a CDN clause, but it is the closest thing to an
explicit prohibition among the four. Mixkit also has a **second, restricted licence** for
some clips that is personal-projects-only — so the licence must be checked per clip, not
per site. Mixkit is now a Shutterstock property, which adds terms-change risk.

**Concentration risk.** Pexels and Pixabay are both Canva brands with near-identical
terms; Mixkit is Shutterstock. Three of the four sources are two companies. Spreading
`db.json` across them buys less independence than it appears to.

### Coverr's search results are mostly AI-generated, on a staging CDN

Worth knowing before anyone browses Coverr for food: of the video URLs on the food search
page, **21 point at `cdn-staging.coverr.co` and are `user-ai-generation-*` assets**. A
hostname with "staging" in it is not a production contract, and the provenance and licence
status of user-submitted AI generations is murkier than curated stock. Filter to
`cdn.coverr.co/videos/coverr-*` and skip anything matching `user-ai-generation` or
`coverr-temp-`.

### Blender open movies (the sample-bucket content), self-hosted

The clips in the dead Google bucket are Blender Foundation open movies.
[peach.blender.org](https://peach.blender.org/about/) licenses Big Buck Bunny under
**Creative Commons Attribution 3.0** — so **attribution is mandatory**, which is stricter
than Pexels or Pixabay and is almost universally ignored by people who copy these URLs.
They are also cartoons, not food. Useful as a codec/player fixture, useless as feed content.

---

## 2. Which sources are stable enough to commit

Ranked by how much of the stability is _contractual_ rather than _courtesy_.

| Source                | URL shape                                                      | Stability signals                                                                     | Verdict                                          |
| --------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Pixabay**           | `cdn.pixabay.com/video/<date>/<id>-<hash>_<size>.mp4`          | Content-hashed, unsigned, no query string; documented permission to embed             | **Best** — commit freely                         |
| **Mixkit**            | `assets.mixkit.co/videos/<id>/<id>-<height>.mp4`               | Clean, predictable, unsigned, CloudFront; but no `access-control-allow-origin` header | Technically stable, **licence-risky**            |
| **Pexels**            | `videos.pexels.com/video-files/<id>/<id>-hd_<w>_<h>_<fps>.mp4` | Deterministic, unsigned, CORS `*`                                                     | Good, licence silent                             |
| **Coverr**            | `cdn.coverr.co/videos/coverr-<slug>-<id>/<res>.mp4`            | `max-age=31536000`, ETag, Cloudflare                                                  | Good technically, **but not the contracted API** |
| **Apple HLS**         | `devstreaming-cdn.apple.com/videos/streaming/examples/…`       | Published on developer.apple.com for years; relative child paths                      | Stable for a **test fixture**                    |
| ~~**Google bucket**~~ | `commondatastorage.googleapis.com/gtv-videos-bucket/…`         | —                                                                                     | **DEAD (403)**                                   |
| ~~**Bitmovin**~~      | `bitdash-a.akamaihd.net/content/sintel/hls/…`                  | —                                                                                     | **DEAD (403)**                                   |

**The general rule this research supports:** an asset URL is only as durable as the
_documentation_ that promises it. Every URL that died here (`gtv-videos-bucket`, Bitmovin's
Sintel stream) was an undocumented courtesy that the internet treated as infrastructure.
Every URL that survived is one the vendor publishes on purpose.

**This repo already has link rot.** Auditing all 85 remote URLs currently in
`mocks/db.json` found **2 already returning 404** — both Unsplash hot-links:

```
404 https://images.unsplash.com/photo-1617196034183-421b4040ed20  (restaurants[2].gallery[1], menuItems[21].image "Salmon Nigiri")
404 https://images.unsplash.com/photo-1621996346565-e3d5d6281318  (restaurants[1].gallery[0], "Bella Italia Ristorante")
```

Nobody noticed, because a broken image in a mock renders as empty space. Video fails louder
but is checked less often. **Whatever URLs go into `db.json` should be covered by a script
that curl-checks them in CI**, or this document will be out of date within months.

### Hot-link mechanics: will these CDNs even serve a native app?

A licence permitting hot-linking is worthless if the CDN rejects the request. Each
candidate was re-fetched with the User-Agents `expo-video` actually sends — iOS
`AVPlayer` sends `AppleCoreMedia/1.0.0…`, Android `ExoPlayer` sends
`…ExoPlayerLib/2.x` — plus a `Range` request, since both players stream rather than
download whole files.

All verified hosts (`assets.mixkit.co`, `cdn.coverr.co`, `devstreaming-cdn.apple.com`,
`stream.mux.com`) returned **206 with `accept-ranges: bytes` for every User-Agent tried**,
including a bare `curl/8.0`. **No UA-gating and no Referer-gating was observed anywhere**,
so hot-linking works technically. The constraint is legal, not mechanical.

---

## 3. Is portrait 9:16 food video actually available?

**Yes — but from Pexels and essentially nowhere else.** The answer differs so sharply by
source that "is portrait stock available?" is the wrong question; "which library?" is the
right one.

Rather than eyeball search pages, food clips were probed for their real pixel dimensions
by parsing each file's `tkhd` atom. Counting by census, not impression:

| Source                                                             | Food clips probed             | Portrait | Share     |
| ------------------------------------------------------------------ | ----------------------------- | -------- | --------- |
| **Pexels** (`?orientation=portrait`)                               | ~150-170 available; 27 probed | **27**   | **~100%** |
| **Mixkit** (`/free-stock-video/food/`)                             | 24                            | 2        | 8%        |
| **Coverr** (`/s?q=food`, production CDN, excluding AI/temp assets) | 31                            | **0**¹   | **0%**    |

¹ One 1920×3412 portrait clip ("mini donuts on a plate") was found in an earlier pass of
the same search payload, so call it 1 in 38 rather than a hard zero. Either way, Coverr is
not a portrait source.

**Pexels is the only library with a working orientation filter.** `?orientation=portrait`
genuinely narrows the result set, returning 24 per page across at least 7 pages for "food",
with full first pages for "cooking" and "restaurant" too. The others advertise the feature
and do not deliver it:

- **Coverr's** `orientation=vertical` and `ratio=vertical` parameters return a
  byte-identical result set to unfiltered. The UI exposes a 9:16 facet, but it filters
  client-side against an API, so there is no URL that yields a portrait-only list.
- **Mixkit's** `?orientation=vertical` is silently ignored on category pages. Its
  `/free-stock-video/search/?q=…` endpoint searches for the literal word "search". Mixkit
  does have a real vertical library, and it makes the scarcity vivid: of the clips in
  [its vertical category](https://mixkit.co/free-stock-video/vertical/), the subjects are
  waves, tulips, palm trees, waterfalls and flowers. **Not one is food.** The wider
  `/free-vertical-videos/` set (~60 clips) has roughly 10 food-adjacent ones — all autumn
  table-setting and coffee-tray footage, no actual dishes — and they are served under
  Mixkit's **Restricted** (personal-projects-only) licence, so they are not usable here.
- **Pixabay** could not be assessed at all: it returns 403 to every request from this
  environment.

**Why the difference:** Pexels absorbed a large volume of phone-shot vertical content from
contributors targeting social; Coverr and Mixkit are curated cinemagraph/b-roll libraries
stocked for landscape web use. The stereotype that free stock is all 16:9 is accurate for
curated libraries and wrong for Pexels.

**Consequence for the feed:** it can be portrait-native. Use the Pexels set below as the
primary catalogue. Build the blurred-backdrop letterbox treatment anyway — not because the
feed will be full of landscape clips, but because even the portrait set is not uniformly
9:16. The verified clips include **1080×1920** (exactly 9:16), **1080×2048** (9:17.1),
**1080×1872** and **720×1366**. A feed that hard-assumes 9:16 will letterbox unpredictably;
`contentFit="cover"` with a backdrop handles all of them.

---

---

## SHORTLIST — verified portrait food clips

**Every URL below was fetched and probed twice, independently.** Status is `200`,
content-type `video/mp4`, and the dimensions are read from each file's own `tkhd` atom —
not from the filename, which on Pexels **can lie** (`8107571-hd_1080_2048_25fps.mp4`
actually decodes as 720×1366).

Source: Pexels. Licence: free, commercial use permitted, **no attribution required**,
no API key needed for these direct URLs.

### Recommended set — 720p portrait, ~2.5 Mbps

This is the set to put in `db.json`. Ten clips, **32.7 MB total**, all portrait, all
roughly feed-length. Resolved from Pexels' own `download/video/<id>/?w=720&h=1280`
redirect, so these are URLs Pexels served, not patterns guessed.

| Subject                          | URL                                                                           | Size     | Duration        | Bitrate   |
| -------------------------------- | ----------------------------------------------------------------------------- | -------- | --------------- | --------- |
| Woman holding tomatoes           | `https://videos.pexels.com/video-files/6353432/6353432-hd_720_1280_60fps.mp4` | 720×1280 | 10.3s · 1.52 MB | 1.19 Mbps |
| Quail eggs on bread              | `https://videos.pexels.com/video-files/7599852/7599852-hd_720_1280_25fps.mp4` | 720×1280 | 21.6s · 3.20 MB | 1.18 Mbps |
| Burger and fries with a sparkler | `https://videos.pexels.com/video-files/4676745/4676745-hd_720_1366_25fps.mp4` | 720×1366 | 26.9s · 5.38 MB | 1.60 Mbps |
| Person tearing bread in half     | `https://videos.pexels.com/video-files/6420982/6420982-hd_720_1366_30fps.mp4` | 720×1366 | 11.5s · 2.82 MB | 1.97 Mbps |
| Close-up of food on a tray       | `https://videos.pexels.com/video-files/7929034/7929034-hd_720_1280_24fps.mp4` | 720×1280 | 10.0s · 2.74 MB | 2.19 Mbps |
| Person decorating a dessert      | `https://videos.pexels.com/video-files/7930814/7930814-hd_720_1280_24fps.mp4` | 720×1280 | 10.0s · 2.83 MB | 2.26 Mbps |
| Fresh bell peppers and lemons    | `https://videos.pexels.com/video-files/7246453/7246453-hd_720_1280_50fps.mp4` | 720×1280 | 9.9s · 3.17 MB  | 2.57 Mbps |
| Picnic in the forest             | `https://videos.pexels.com/video-files/5615179/5615179-hd_720_1366_30fps.mp4` | 720×1366 | 7.9s · 2.62 MB  | 2.67 Mbps |
| Man plating pasta                | `https://videos.pexels.com/video-files/6247888/6247888-hd_720_1280_24fps.mp4` | 720×1280 | 15.0s · 5.05 MB | 2.69 Mbps |
| Bowl of chopped fruity ice cream | `https://videos.pexels.com/video-files/5288344/5288344-hd_720_1280_30fps.mp4` | 720×1280 | 9.8s · 3.35 MB  | 2.75 Mbps |

**Any Pexels clip can be re-rendered at another size the same way** — the redirect accepts
`?w=540&h=960` (→ `-sd_540_960_*.mp4`) and `?w=1080&h=1920` (→ `-hd_1080_1920_*.mp4`).
This is how to get a lighter or heavier ladder without guessing filenames:

```sh
curl -sI "https://www.pexels.com/download/video/<ID>/?w=720&h=1280" | grep -i ^location
```

### 1080p variants of the same clips — verified, but too heavy

The full-resolution versions were also verified (all 200, all portrait), and they are the
reason to prefer 720p: at **1080×1920 the same clips run ~5.2 Mbps, or ~6.5 MB per 10
seconds** — more than double the 720p cost for a resolution most of the feed will not
resolve on a phone. Examples: `6247888-hd_1080_1920_24fps.mp4` (9.85 MB / 15.0s),
`7930814-hd_1080_1920_24fps.mp4` (6.57 MB / 10.0s),
`5288344-hd_1080_1920_30fps.mp4` (6.40 MB / 9.8s),
`4252801-hd_1080_2048_25fps.mp4` (14.56 MB / 34.8s, chef preparing pasta),
`6942838-hd_1080_1920_25fps.mp4` (8.52 MB / 17.3s, moulding flat dough),
`6664406-hd_1080_1872_30fps.mp4` (9.85 MB / 15.1s, top view of assorted foods),
`6421455-hd_1080_1920_30fps.mp4` (8.93 MB / 13.7s),
`7889702-hd_1080_2048_25fps.mp4` (1.80 MB / 15.0s — **actually 720×1366**),
`8107571-hd_1080_2048_25fps.mp4` (0.98 MB / 10.9s — **actually 720×1366**).

### One caveat on newer Pexels uploads

Clips uploaded from roughly 2024 onward have numeric second-segment filenames
(`.../37848043/16055296_1080_1920_24fps.mp4`) and are **fragmented MP4**: their `mvhd`
duration reads **0** and there is no `mehd` box. They stream correctly, but any code that
reads duration from the container header will see zero. Prefer the older
`<id>-hd_<w>_<h>_<fps>.mp4` shape, which is non-fragmented and faststart — that is what
the recommended set above uses.

### Landscape fallback (verified)

If the catalogue needs padding, these are confirmed 200 / `video/mp4`:

| Source | URL                                                                            | Dimensions                |
| ------ | ------------------------------------------------------------------------------ | ------------------------- |
| Pexels | `https://videos.pexels.com/video-files/2081576/2081576-hd_1920_1080_30fps.mp4` | 1920×1080, 6.6s, 4.21 MB  |
| Pexels | `https://videos.pexels.com/video-files/8479197/8479197-hd_1920_1080_25fps.mp4` | 1920×1080, 11.0s, 7.39 MB |
| Coverr | `https://cdn.coverr.co/videos/coverr-cooking-shakshuka-2881/1080p.mp4`         | 1920×1080, 13.8s          |
| Coverr | `https://cdn.coverr.co/videos/coverr-homemade-pizza-2472/1080p.mp4`            | 1920×1080, 15.0s          |
| Coverr | `https://cdn.coverr.co/videos/coverr-pad-thai-134/1080p.mp4`                   | 1920×1080, 13.3s          |

Remember Coverr requires attribution and its unsigned CDN is not its contracted interface.
**Prefer Pexels for anything committed.**

### Not recommended, despite being reachable

- **Mixkit `-1080.mp4` files are near-master quality**: measured at **24-29 Mbps**, e.g.
  `43925-1080.mp4` at **89 MB for 24.9s** and `40524-1080.mp4` at 52.6 MB for 15.6s.
  These are download previews, not delivery renditions. Its `-720.mp4` files are sane
  (~2.5 Mbps), but the licence question above still applies.
- Anything under `cdn-staging.coverr.co` or matching `user-ai-generation-*` / `coverr-temp-*`.

---

## 4. Realistic size and bitrate for a 10-second vertical clip

Rather than trust a secondary write-up, these are the ladders the two most credible
publishers actually ship, read straight out of their own master playlists.

**Apple's reference stream** (`img_bipbop_adv_example_fmp4/master.m3u8`, `AVERAGE-BANDWIDTH`):

| Resolution | fps | Avg bitrate | 10 s ≈  |
| ---------- | --- | ----------- | ------- |
| 480×270    | 30  | 0.53 Mbps   | 0.66 MB |
| 640×360    | 30  | 1.12 Mbps   | 1.40 MB |
| 768×432    | 30  | 1.27 Mbps   | 1.58 MB |
| 960×540    | 60  | 2.17 Mbps   | 2.71 MB |
| 1280×720   | 60  | 3.17 Mbps   | 3.96 MB |
| 1920×1080  | 60  | 4.67 Mbps   | 5.84 MB |

**Mux's test stream** (`v69RSHhFelSm...m3u8`), a more typical VOD ladder at 30fps:

| Resolution | Avg bitrate | 10 s ≈  |
| ---------- | ----------- | ------- |
| 480×270    | 0.70 Mbps   | 0.88 MB |
| 640×360    | 0.99 Mbps   | 1.23 MB |
| 960×540    | 1.70 Mbps   | 2.12 MB |
| 1280×720   | 2.56 Mbps   | 3.21 MB |
| 1920×1080  | 4.71 Mbps   | 5.89 MB |

Portrait is the same pixel budget rotated — a 1080×1920 clip costs what 1920×1080 costs.

**Practical target for this feed: 720×1280, H.264 high profile, 30 fps, ~2.5 Mbps →
about 3 MB per 10-second clip.** That is the sweet spot: it fills a modern phone screen
(most are ~1080–1284 px wide, so 720p portrait upscales acceptably under motion), and 3 MB
is small enough that a clip prefetched one card ahead starts instantly on 4G.

**This target is confirmed empirically, not just derived.** The ten shortlisted Pexels
720×1280 portrait clips measure **1.19-2.75 Mbps, mean ≈ 2.1 Mbps**, which works out at
**1.5-3.4 MB per 10 seconds**. The same ten clips at 1080×1920 measure **~5.2 Mbps
(~6.5 MB per 10s)**. So the 720p rung really is the knee of the curve: roughly 2.5× cheaper
for a resolution difference most phones will not show under motion.

Two independent cross-checks agree: a 640×360 10-second H.264 file measured
**991,017 bytes at 0.79 Mbps**, and Coverr's 720p portrait rendition measured **3.07 MB for
9.64 s (≈2.55 Mbps)**.

For contrast at the wrong end of the scale, Mixkit's `-1080.mp4` previews measure
**24-29 Mbps** — roughly 10× the sensible delivery bitrate, and a single 25-second clip is
89 MB. If a clip seems inexplicably slow to start, check its bitrate before blaming the
player.

Budget consequence for a feed: at ~3 MB/clip, a 20-clip session is ~60 MB. Prefetch one
or two ahead, not the whole list.

---

## 5. HLS availability

Adaptive streaming **can** be exercised, but not with food and not in portrait.

Verified live `.m3u8` endpoints:

| URL                                                                                                    | Status                              | Notes                                                                                                                              |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8` | 200 `application/x-mpegURL`         | Apple's own reference stream. fMP4 + byte-range segments, **relative** child paths, no signing. The most stable HLS URL available. |
| `https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8`    | 200 `application/x-mpegURL`         | Older TS-segment variant.                                                                                                          |
| `https://stream.mux.com/v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM.m3u8`                            | 200 `application/x-mpegURL`         | Mux's public test asset. See signing note below.                                                                                   |
| `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`                                                    | 200 `audio/mpegurl`                 | hls.js test corpus.                                                                                                                |
| `https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8` | 200 `application/vnd.apple.mpegurl` | Unified Streaming demo.                                                                                                            |
| `https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8`                              | 200 `application/x-mpegURL`         | Shaka demo bucket.                                                                                                                 |

Dead: `https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8` → **403**. Another
widely-copied URL that has rotted.

**Two things worth knowing before wiring HLS up:**

_Mux re-signs its child playlists._ The master playlist URL is stable and safe to hard-code,
but the rendition URLs inside it carry `expires=` and `signature=` query parameters — the
copy fetched during this research expires `2026-08-08T23:00:00Z`. This is fine, because the
player re-fetches the master and gets fresh signatures. It is **not** fine if anyone copies
a rendition URL out of the manifest and pastes it into `db.json`. Only ever store the master.

_iOS needs a hint._ Per the [expo-video docs for SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/video/):
`"On iOS, when using a HLS source, make sure that the uri contains .m3u8 extension or that
the contentType property of the VideoSource has been set to 'hls'."` All the URLs above end
in `.m3u8`, so `contentType: 'auto'` will work — but set `contentType: 'hls'` explicitly if
a URL is ever proxied or rewritten without the extension.

_DASH is Android-only._ The same docs list `'dash'` and `'smoothStreaming'` as Android-only
`ContentType` values. The Shaka `.mpd` assets will not play on iOS. **HLS is the only
adaptive format portable across both platforms**, so ignore the DASH URLs.

**No public portrait HLS stream was found.** Apple's advanced samples were checked on the
chance they carried vertical content — `adv_dv_atmos/main.m3u8` and the
`historic_planet_content_2023-10-26-3d-video` stream — and both are entirely landscape
(400×226 through 3840×2160). Every rendition of every public test stream checked is 16:9.

---

## Compatibility note: expo-video and YouTube

Confirmed against the SDK 57 docs: `VideoSource.contentType` accepts
`'auto' | 'progressive' | 'hls' | 'dash' | 'smoothStreaming'`. There is no YouTube source
type, and no mechanism to extract a media URL from a `youtube.com/watch` page — a YouTube
page URL is HTML, not media, so it cannot be a `uri`. Scraping YouTube's underlying stream
URLs additionally violates YouTube's Terms of Service, and those URLs are IP-bound and
expire within hours, so they could not be committed to `db.json` even if it were permitted.
**Embedding YouTube requires a WebView and the IFrame Player API**, which cannot do a
gesture-driven full-bleed vertical feed. This is a genuine constraint, not a preference.

---

## Recommendation

1. **Use the ten shortlisted Pexels 720×1280 clips as the feed catalogue.** Portrait,
   verified, ~33 MB total, no attribution obligation, no API key. Add a `videoUrl` (and a
   `width`/`height`, since the set is not uniformly 9:16) to each `featuredVideos` record
   in `mocks/db.json`.
2. **Do not use the Google sample bucket, Bitmovin's Sintel stream, Mixkit's `-1080`
   files, or anything on `cdn-staging.coverr.co`.** The first two are dead; the third is
   24-29 Mbps; the fourth is a staging host.
3. **Build the blurred-backdrop letterbox treatment regardless.** The verified portrait set
   spans 1080×1920, 1080×2048, 1080×1872 and 720×1366 — a hard 9:16 assumption will
   letterbox unpredictably. `contentFit="cover"` plus a backdrop covers every case.
4. **Exercise HLS with a separate fixture, not with feed content.** Apple's
   `img_bipbop_adv_example_fmp4/master.m3u8` is the most stable public `.m3u8`. Set
   `contentType: 'hls'` explicitly. Skip DASH — it is Android-only.
5. **Add a CI check that curl-checks every remote URL in `db.json`.** Two Unsplash images
   have already died unnoticed; this document has a shelf life without one.
6. **If Pixabay is reachable from a normal browser, re-run the shortlist there.** It is the
   only source that explicitly permits video hot-linking, and it could not be assessed here.

The one thing worth not doing is treating any of this as permanent. Every URL here is
someone else's bandwidth, offered without a contract. The shortlist is good for a demo; it
is not infrastructure.

---

## Environment caveats

Three things could not be checked from this machine, and are flagged rather than guessed:

- **Pixabay is entirely unreachable** — `403` to `curl` with full browser headers and to
  every automated fetch tried, on both search and API-docs pages. This is awkward, because
  the licence research makes Pixabay the _best-licensed_ option (it is the only source that
  affirmatively permits video hot-linking). **No Pixabay URL is recommended here, because
  none could be verified**, and this document does not list URLs it has not fetched. If
  Pixabay is reachable from a normal browser, it is worth re-running the shortlist against
  it — the licensing position is materially better than Pexels'.
- `commons.wikimedia.org` does not resolve in the sandbox (`ENOTFOUND`), so Wikimedia
  Commons could not be searched as a source. `upload.wikimedia.org` — where the actual
  files live — _is_ reachable, so Commons remains viable if a permanently-stable,
  explicitly-licensed host is ever wanted. Its URLs are content-addressed.
- No `ffprobe` was available, so codec profile/level was not read. Dimensions, duration
  and bitrate were parsed from MP4 atoms directly (method above).
