# Clips feed

**What**: the Clips tab — a full-screen vertical pager over `/clips`, one video
per page, with an end card after the last clip.

**Architecture** (validated on hardware, [#27](https://github.com/hedonarc/foodio/issues/27)
and [#34](https://github.com/hedonarc/foodio/issues/34)): `FlatList` +
`pagingEnabled` — a deliberate AGENTS.md deviation, because FlashList makes
`windowSize` a no-op and the pinned live-cell count is the whole game — one
player per rendered `VideoView`, `windowSize={3}`.

**Playback policy** ([#24](https://github.com/hedonarc/foodio/issues/24)):
autoplay on the settled index; muted by default with unmute as one
session-scoped global (`playback.store`, never persisted); loop, don't
auto-advance; pause and reset on scroll away; `thumbnailUrl` whenever the
video isn't playing. `audioMixingMode` stays `mixWithOthers` while muted so
opening the tab never kills the user's music; unmuting claims the session.

**Accessibility** ([#32](https://github.com/hedonarc/foodio/issues/32)):
reduce motion disables autoplay — poster plus play button, one tap plays once
without looping. Each cell is a single accessibility element, author first;
the video surface is hidden from the tree; the mute button confesses it is
global ("Unmute all clips").

**Edges** ([#37](https://github.com/hedonarc/foodio/issues/37)): end card with
a Browse-restaurants route; `EmptyState` (no "be the first" — there is no
posting flow); `ErrorState` with retry. Offline leans on nothing: there is no
"is this cached?" API, so a stalled clip simply shows its poster.

**Legibility**: the bottom overlay sits on a `LinearGradient` scrim
(transparent → 80% black). Found on a physical Galaxy A15 — food footage is
frequently bright and pale, and white text alone vanished over it. The scrim
makes contrast a property of the layout rather than a hope about the footage.

**Who owns the bottom edge**: video stays full-bleed, controls do not. In the
Clips tab the tab bar owns that edge, so the overlay adds nothing; in the
`clip/[id]` viewer nothing does, so the cell is passed `ownsBottomEdge` and
insets itself. Applying both would double-pad — which is why it is a prop
rather than an unconditional inset.

**Home**: the clip shelf came off — the tab is the surface now. `ClipCarousel`
is unused pending the restaurant-page slice, which reworks it into the
labelled shelves of [#26](https://github.com/hedonarc/foodio/issues/26).
