# What expo-video actually supports in a scrolling feed

Research for [#23](https://github.com/hedonarc/foodio/issues/23) (parent: [#19](https://github.com/hedonarc/foodio/issues/19)). Establishes what is **documented** for SDK 57, what the **source proves**, and what is **inference** — for a full-screen vertical video pager.

Every claim below is labelled:

| Label           | Meaning                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------ |
| **[DOC]**       | Stated in the SDK 57 versioned docs. Cited with anchor.                                    |
| **[SRC]**       | Proven by expo-video source on the `sdk-57` branch of `expo/expo`. Cited with file path.   |
| **[COMMUNITY]** | Issue tracker or third-party practice. Not a guarantee.                                    |
| **[INFERENCE]** | Our reasoning from the above. Not documented. Treat as a hypothesis to verify by building. |

Primary sources: <https://docs.expo.dev/versions/v57.0.0/sdk/video/> and `github.com/expo/expo` at tag/branch `sdk-57`.

---

## Version

**[SRC]** `npx expo install expo-video` on this repo resolves **`expo-video@57.0.2`**.

The pin is `"expo-video": "~57.0.2"` in `node_modules/expo/bundledNativeModules.json` (from the installed `expo@57.0.9`) — the exact file `expo install` consults — and it matches [the sdk-57 branch copy](https://raw.githubusercontent.com/expo/expo/sdk-57/packages/expo/bundledNativeModules.json). **[DOC]** The docs page agrees: "Recommended version: ~57.0.2". `57.0.2` is also the current npm `latest`, so the range resolves to it exactly.

**[DOC]** expo-video is **included in Expo Go** on SDK 57 (Android, iOS, tvOS, Web badges on the doc page). A development build is only required for the config-plugin options `supportsBackgroundPlayback` / `supportsPictureInPicture`, which "cannot be set at runtime and require building a new app binary", and for the iOS asset-transport extension point.

**[DOC — absence]** The SDK 57 expo-video page contains **no** mention of "New Architecture", "Fabric" or "bridgeless". It makes no compatibility statement either way. Since SDK 57 has the New Architecture on by default and expo-video is a first-party module shipped in Expo Go, we treat it as supported — but that is **[INFERENCE]**, not a documented guarantee.

Also worth pinning now, both currently **not installed**:

| package                   | SDK 57 pin (`bundledNativeModules.json`) | npm `latest` today |
| ------------------------- | ---------------------------------------- | ------------------ |
| `expo-video`              | `~57.0.2`                                | 57.0.2             |
| `@shopify/flash-list`     | `2.0.2` (exact, no range)                | 2.3.2              |
| `react-native-pager-view` | `8.0.2` (exact, no range)                | 8.0.4              |

The two pager candidates are pinned to **exact** versions, so `expo install` will pull `2.0.2` / `8.0.2`, not the newest release.

**[SRC] Do not pin below `57.0.2`.** `57.0.0` and `57.0.1` "do not introduce any user-facing changes", and `57.0.2` carries "[iOS] Update the way the VideoPlayer releases to comply with the modified SharedObject lifecycle" — the fix for [#47569](https://github.com/expo/expo/issues/47569), an SDK 57 regression where audio kept playing after the player was released on unmount. For a feed, that regression is exactly the failure mode you would spend a day misdiagnosing.

---

## 1. How many `VideoPlayer` instances are practical?

**[DOC — NOT DOCUMENTED]** The SDK 57 docs give **no number, no recommendation, and no guidance** on how many `VideoPlayer` instances may exist at once. There is no mention of decoder limits, resource exhaustion, or a player budget. Do not let a plan cite the docs for a number — the docs do not contain one.

What the docs _do_ specify is **lifecycle**, and that is where the real risk sits:

**[DOC]** `useVideoPlayer` releases for you — the player is "automatically cleaned up when the component is unmounted" ([`#usevideoplayersource-setup-playerbuilderoptions`](https://docs.expo.dev/versions/v57.0.0/sdk/video/#usevideoplayersource-setup-playerbuilderoptions)).

**[DOC]** `createVideoPlayer` does not: it "Creates a direct instance of VideoPlayer that doesn't release automatically", and it is "your responsibility to call the release() method when the player is no longer needed" — otherwise "this approach may lead to memory leaks" ([`#using-the-videoplayer-directly`](https://docs.expo.dev/versions/v57.0.0/sdk/video/#using-the-videoplayer-directly)).

**[SRC] The two platforms differ in a way that matters.** Both keep a process-wide registry of live players, and neither imposes any cap or pool — but:

- **iOS** holds them **weakly**: `NSHashTable<VideoPlayer>.weakObjects()` (`packages/expo-video/ios/VideoManager.swift`). A player that JS drops can be deallocated.
- **Android** holds them **strongly**: `videoPlayersToVideoViews = mutableMapOf<VideoPlayer, MutableList<VideoView>>()` in the `object VideoManager` singleton (`packages/expo-video/android/.../managers/VideoManager.kt`). The entry is only removed by `unregisterVideoPlayer(...)`.

**[INFERENCE]** On Android, therefore, a player that is never released stays reachable from a singleton for the life of the process. Android is both the platform with the tighter decoder budget _and_ the one that will not quietly collect your mistake. Leak discipline is an Android correctness issue, not just a tidiness one.

**[SRC + DOC — the trap]** A player that is **not attached to a `VideoView` still buffers**. The changelog entry for `1.1.1` reads "[Android] The media will now be buffered even when the player is unmounted to match iOS behavior" (`packages/expo-video/CHANGELOG.md`), and the docs state the same thing positively: "Even when the player is not connected to a `VideoView`, it will fill the buffers." This is deliberate — it is the whole preloading mechanism (question 4) — but the flip side is that **taking a video off screen does not stop its network and memory cost**. Only releasing the player, or clearing its source, does. The release path has to be explicit.

**[SRC]** Memory-relevant fixes have been landing steadily, which is itself evidence this area is delicate: `2.0.4` "[iOS] Fix `AVPlayer` not deallocating when the player is unmounted"; `1.2.3` "[iOS] Fix a race condition causing crashes when deallocating the player"; `1.1.0` "Fix memory leaks on fast refresh"; and in the current release, `57.0.2` "[iOS] Update the way the VideoPlayer releases to comply with the modified SharedObject lifecycle."

**[INFERENCE]** The real ceiling is not expo-video's, it is the platform's: Android devices expose a limited number of concurrent hardware video decoders (commonly a handful on mid-range hardware), and each `VideoPlayer` backs an ExoPlayer instance. **A budget of 3 live players — previous, current, next — is the defensible starting point**, and it should be validated by measurement on a real low-end Android device, not assumed. We have no documented figure to lean on.

**Practical rule:** prefer `useVideoPlayer` so release is structural. Reach for `createVideoPlayer` only if a deliberate pool is built, and accept that you then own every `release()` call.

---

## 2. The Android caveat, and what it forces

**[DOC]** The exact warning, at the end of [`#using-the-videoplayer-directly`](https://docs.expo.dev/versions/v57.0.0/sdk/video/#using-the-videoplayer-directly):

> On Android, mounting multiple `VideoView` components at the same time with the same `VideoPlayer` instance will not work due to a platform limitation.

Read it precisely:

- The documented failure mode is **"will not work"**. The docs do **not** say it crashes and do **not** say "only the first view renders". Treat the behaviour as undefined.
- It is scoped **"On Android"** only.
- **No workaround or alternative is named.** The callout simply ends.

**[COMMUNITY]** The docs link to [expo/expo#35012](https://github.com/expo/expo/issues/35012) ("[expo-video] Black screen when reusing a videoplayer on android", opened 2025-02-18, now closed). The reporter's observed symptom: mounting four `VideoView`s against one `useVideoPlayer` gives **a black screen** while audio continues and controls stay responsive. That is a report, not a spec — but it matches the mechanism (one ExoPlayer renders into one surface; the other views get no frames).

### What it forces structurally

**[INFERENCE]** It forces **one player per rendered `VideoView`**. The two viable shapes:

1. **One player per feed item.** Each item cell owns a `useVideoPlayer`. Simple, and release is automatic on unmount — but the number of live players is then dictated by the list's windowing, which is exactly the thing you do not want a virtualised list deciding for you.
2. **A fixed pool of N players, decoupled from the list window.** The list renders N `VideoView`s (or one, see below), and a small controller assigns players to indices as the active index moves. Bounded memory by construction, but you own the assignment logic and, if you use `createVideoPlayer`, every `release()`.

**[DOC]** There is a third shape, and it is the one the docs actually demonstrate: **one `VideoView`, multiple players, swap which player is passed to it.** The official preloading example uses two `useVideoPlayer` instances and switches which is handed to a single `<VideoView player={currentPlayer} />`. This sidesteps the Android caveat entirely — distinct players, one view — but it gives up the free scroll animation of a list, because there is only ever one view on screen.

**[DOC] A second Android issue lands directly on this use case.** From [`#known-issues`](https://docs.expo.dev/versions/v57.0.0/sdk/video/#known-issues):

> When two `VideoView` components are overlapping and have the `contentFit` prop set to `cover`, one of the videos may be displayed out of bounds.

The documented workaround is to "use the `surfaceType` prop and set it to `textureView`". A full-screen vertical pager is _by definition_ overlapping full-screen views with `contentFit: 'cover'`, so **expect to need `surfaceType="textureView"`**.

**[SRC] The cost of that switch is documented, and it is not free.** From the `SurfaceType` doc comment (`packages/expo-video/src/VideoView.types.ts`), `surfaceView` — the **default** — "should be used in the majority of cases" and "Provides significantly lower power consumption, better performance, and more features". `textureView` "Should be used in cases where the SurfaceView is not supported or causes issues (for example, **overlapping video views**)".

So the docs name our exact scenario as a `textureView` case, while also saying `textureView` is the slower, more power-hungry path. **[INFERENCE]** This is a genuine trade-off to measure on device, and it is Android-only. The prop is also `@default 'surfaceView'` and "should not be changed at runtime" — so the choice is made per-view at mount, which a recycling list makes awkward to vary.

**[DOC]** Unrelated but adjacent: "Only one player can be in Picture in Picture (PiP) mode at a time", and on Android "the JS runtime is paused when the `VideoView` is in fullscreen mode".

---

## 3. `useCaching` — what it caches, and does it survive relaunch?

**[DOC]** `useCaching` is a **`VideoSource` field**, not a player property. `boolean`, **default `false`**, Android + iOS ([`#videosource`](https://docs.expo.dev/versions/v57.0.0/sdk/video/#videosource), [`#caching-videos`](https://docs.expo.dev/versions/v57.0.0/sdk/video/#caching-videos)).

**Does it survive relaunch? [DOC] Yes — with a caveat.** The docs state the cache "is persistent and will be cleared on a least-recently-used basis" once the preferred size is exceeded, and that "The cache functions offline" — a partially cached video plays from cache "until the cached data is exhausted". But the docs also warn the **system may clear it under low storage**, so "it's not advisable to depend on the cache to store critical data".

**[SRC] The source confirms both halves.** Both platforms write into the OS _caches_ directory — persistent across relaunch, but explicitly reclaimable by the OS:

|                           | Android                                           | iOS                                          |
| ------------------------- | ------------------------------------------------- | -------------------------------------------- |
| Implementation            | media3 `SimpleCache`                              | custom `AVAssetResourceLoader` interception  |
| File                      | `android/.../video/VideoCache.kt`                 | `ios/Cache/VideoCacheManager.swift`          |
| Location                  | `context.cacheDir` → `ExpoVideoCache/<uuid>`      | `.cachesDirectory` → `expo-video-cache`      |
| Default max               | `DEFAULT_CACHE_SIZE = 1024 * 1024 * 1024L` (1 GB) | `defaultMaxCacheSize = 1_024_000_000` (1 GB) |
| Eviction                  | `LeastRecentlyUsedCacheEvictor`                   | manual LRU sort on `contentAccessDate`       |
| Size setting persisted in | `SharedPreferences` (`ExpoVideoCache`)            | `UserDefaults`                               |

The cache **directory name is itself persisted** (Android stores it in `SharedPreferences` under `cacheDir`), so the cache index survives process death rather than being regenerated. **[DOC]** confirms the configured size is durable too: "Value set by this function is persistent."

**[DOC] What it will not cache:**

> Due to platform limitations, the cache cannot be used with HLS video sources on iOS. Caching DRM-protected videos is not supported on Android and iOS.

**This is a content-format decision, not an implementation detail.** `db.json` currently holds `featuredVideos` entries with only a `thumbnail` and no media URL, so the format is still ours to choose. **[INFERENCE]** If the catalogue is HLS, iOS gets **no caching at all** and every re-view re-downloads; if it is progressive MP4, both platforms cache. For a small curated catalogue of short clips — which is what #19 describes — **progressive MP4 is the better fit**, and HLS's adaptive-bitrate advantage barely applies at this scale.

**[DOC] Cache management API** (Android + iOS), from [`#managing-the-cache`](https://docs.expo.dev/versions/v57.0.0/sdk/video/#managing-the-cache):

| Function                            | Returns                |
| ----------------------------------- | ---------------------- |
| `clearVideoCacheAsync()`            | `Promise<void>`        |
| `getCurrentVideoCacheSize()`        | `number` (synchronous) |
| `setVideoCacheSizeAsync(sizeBytes)` | `Promise<void>`        |

**[DOC] Both mutating functions carry the same restriction:** "This function can be called only if there are no existing `VideoPlayer` instances." **[SRC]** enforced natively — iOS throws `VideoCacheException("Cannot clear cache while there are active players")` guarded by `VideoManager.shared.hasRegisteredPlayers`.

**[INFERENCE]** So cache configuration is effectively **cold-start-only**. A "clear cache" affordance in settings cannot work while the feed holds players — it has to run before the feed mounts, or after it is fully torn down.

---

## 4. Preload depth

**[DOC] Preloading is an officially documented, supported pattern** — there is a dedicated [`#preloading-videos`](https://docs.expo.dev/versions/v57.0.0/sdk/video/#preloading-videos) section with a runnable example. This is the strongest documented answer of anything in this ticket.

The mechanism, quoted:

> Even when the player is not connected to a `VideoView`, it will fill the buffers.

and the payoff:

> Once it is connected to the `VideoView`, it will be able to start playing without buffering.

**[DOC]** The documented shape is: hold more than one player, keep the next one loaded but unattached, then swap which player the `VideoView` receives. A player may also be created with a `null` source and given one later via `replace()`.

**[DOC — NOT DOCUMENTED] There is no documented preload _depth_.** No guidance on how many players ahead is safe, and no `preload` prop, no prefetch function, no `isLoaded`, no `player.currentStatus` — those names do not exist. The depth question reduces back to question 1, which the docs also do not answer.

**[DOC] The API you actually steer with:**

- **`replaceAsync(source)`** → `Promise<void>`. Prefer this. `replace(source)` "loads the asset data synchronously on the UI thread" on iOS and can block it, and the docs say it "will be deprecated in the future". On Android and Web `replaceAsync` is equivalent to `replace`.
- **`bufferOptions: BufferOptions`** (Android + iOS) — note "Setting individual buffer properties is not supported"; assign a whole object.

  | field                             | platforms    | default                            |
  | --------------------------------- | ------------ | ---------------------------------- |
  | `preferredForwardBufferDuration`  | Android, iOS | Android `20`, iOS `0` (`0` = auto) |
  | `minBufferForPlayback`            | Android      | `2`                                |
  | `maxBufferBytes`                  | Android      | `0` (auto)                         |
  | `prioritizeTimeOverSizeThreshold` | Android      | `false`                            |
  | `waitsToMinimizeStalling`         | iOS          | `true`                             |

- **`status`** — `'idle' | 'loading' | 'readyToPlay' | 'error'`; `readyToPlay` means "loaded enough data to start playing". Plus `bufferedPosition` (seconds, `-1` when indeterminate).
- **Events** `statusChange` and `sourceLoad`, via `useEvent` / `useEventListener` / `player.addListener`.
- **`onFirstFrameRender`** — a `VideoView` prop, "A callback to call after the mounted `VideoPlayer` has rendered the first frame". Useful for crossfading off a thumbnail.

**[INFERENCE] Recommended starting point:** preload depth **1** (the next clip only), with a **3-player budget** — previous, current, next. Lower `preferredForwardBufferDuration` on Android from its default of 20s, since a feed rarely watches 20 seconds ahead of a clip a user may swipe past in two. Keep the `thumbnail` already in `db.json` as the poster behind the video and swap on `onFirstFrameRender`, so a cold clip shows an image rather than black.

**[INFERENCE]** `useCaching: true` plus preload depth 1 means the _next_ clip's bytes land on disk as well as in the buffer, so a backward swipe is free. This compounds well and costs nothing extra — but only if the source is MP4 (see question 3).

---

## 5. Which pager?

### What is already installed

**Nothing suitable.** `FlatList` ships with React Native, so it is the only zero-dependency option. Both alternatives are **new dependencies**, and both are pinned to **exact** versions by SDK 57:

|                           | installed?                | SDK 57 pin      | npm latest |
| ------------------------- | ------------------------- | --------------- | ---------- |
| `FlatList`                | yes (react-native 0.86.2) | —               | —          |
| `@shopify/flash-list`     | **no**                    | `2.0.2` (exact) | 2.3.2      |
| `react-native-pager-view` | **no**                    | `8.0.2` (exact) | 8.0.4      |

### Does FlashList suit full-screen paging?

AGENTS.md mandates FlashList for long lists. Two things need checking: whether it _can_ page, and whether its central mechanism — recycling — helps or hurts here.

**[SRC] It can page — by inheritance, not by design.** `FlashListProps` is declared `extends Omit<ScrollViewProps, "maintainVisibleContentPosition">` (`src/FlashListProps.ts`), and `src/recyclerview/RecyclerView.tsx` spreads `{...rest}` onto the inner scroll view, so `pagingEnabled`, `snapToInterval`, `snapToAlignment`, `decelerationRate` and `disableIntervalMomentum` do reach the native component. **[DOC — NOT DOCUMENTED]** But the FlashList docs never mention any of those props, nor full-screen items, nor carousels. The docs say only that it "uses `ScrollView` under the hood" and point you at RN's ScrollView page. **Nothing confirms paging behaves correctly with recycled cells** — it is undocumented territory, not an endorsed use case.

**[SRC] Viewability works, with one behavioural difference.** `viewabilityConfig`, `onViewableItemsChanged` and `viewabilityConfigCallbackPairs` are all declared in `FlashListProps.ts` with the identical "Changing viewabilityConfig on the fly is not supported" caveat. But **`minimumViewTime` defaults to 250ms in FlashList** (`src/recyclerview/viewability/ViewabilityHelper.ts`: `?? 250`) where FlatList has no default at all. FlashList also exposes a `getFirstVisibleIndex()` ref method that FlatList lacks — a deterministic active-index read that sidesteps threshold heuristics entirely.

**[SRC] v2 fits SDK 57.** "FlashList v2.x has been designed to be new architecture only and will not run on old architecture" (README) — fine, SDK 57 is New Arch by default, and `src/index.ts` throws at _import time_ otherwise. `estimatedItemSize` is "No longer used", so the v1 height-estimating ritual is gone.

**[SRC] The disqualifying detail: the windowing props are no-ops.** FlashList documents `getItemLayout`, `windowSize`, `initialNumToRender` and `maxToRenderPerBatch` as unsupported — "We don't currently plan to implement these props". **There is therefore no way to tell FlashList to keep exactly three items realised.** What it offers instead is `drawDistance`, defaulting to **250dp** (`src/native/config/PlatformHelper.*.ts`). Against a ~800dp full-screen item, that is under a third of a screen — **[INFERENCE]** too small to keep the next clip mounted for preloading, so `drawDistance` would need raising to roughly a full screen height, at which point you are hand-tuning the very thing FlatList exposes directly.

**[SRC]** Two further frictions: FlashList hard-codes `removeClippedSubviews={false}` internally, and it **claims `onScroll` for itself** — `RecyclerView.tsx` sets `onScroll={animatedEvent}` and invokes your handler as a plain JS call. A Reanimated worklet passed as `onScroll` to a `FlashList` is not attached as a native handler and loses its UI-thread benefit. The documented Reanimated path for FlashList is `useScrollOffset(animatedRef)` instead.

**[INFERENCE] But recycling is the problem, not the feature.** FlashList's value is reusing cell components instead of unmounting them. For video that inverts:

- **[SRC]** `useVideoPlayer` is implemented with `useReleasingSharedObject` keyed on `JSON.stringify(parsedSource)` (`packages/expo-video/src/VideoPlayer.tsx`). **Changing the source destroys the native player and builds a new one** — it does not reuse it. So a recycled cell does not get cheap player reuse; it pays a full teardown and rebuild.
- **[COMMUNITY]** expo's own maintainer confirms this is the current behaviour and wants to change it, writing in PR [#46453](https://github.com/expo/expo/pull/46453) that "we should call `replaceAsync` on the player instead of recreating it from scratch (I'll do this in a separate PR)". As of `57.0.2` that separate PR has not landed.

So FlashList's recycling buys us little on the video itself, while adding a second scheduler — the list's — that decides when our players live and die. **[INFERENCE]** The AGENTS.md rule is aimed at long lists of cheap rows, where recycling is a clear win. A full-screen video pager is a long list of _very expensive_ rows where we need to control the live-player count ourselves. Following the letter of the rule here works against its intent.

**[COMMUNITY] And this exact combination has a reported failure.** expo/expo [#40376](https://github.com/expo/expo/issues/40376) — "[expo-video] Video player freezes when used in FlashList on Android (TikTok-like feed)" — describes a 3-player pool behind FlashList where, after roughly ten items, a player freezes black permanently. It was **closed by the stale bot with no maintainer response**. That is not proof the combination is broken, but it is the single closest report to the architecture we are considering, and nobody has refuted it.

### react-native-pager-view

**[SRC]** Verified from the Fabric codegen spec (`src/PagerViewNativeComponent.ts`) — the file being a `codegenNativeComponent` spec with `WithDefault`/`DirectEventHandler` types is itself evidence of New Architecture support:

- `orientation?: WithDefault<'horizontal' | 'vertical', 'horizontal'>` — **vertical paging is native**, not emulated with snap offsets. **[DOC]** the README notes it "does **not** work dynamically".
- `onPageSelected`, `onPageScroll`, `onPageScrollStateChanged` (`'idle' | 'dragging' | 'settling'`).
- Imperative `setPage` / `setPageWithoutAnimation` commands.

**[INFERENCE] Its appeal is that it answers question 6 for free.** `onPageSelected` fires once per settle with an unambiguous integer `position` — no viewability thresholds, no `minimumViewTime` tuning, no debate about what counts as visible. That is the most deterministic active-index signal of the three candidates.

**[SRC] But it does not virtualise, and this is easy to get wrong.** `src/PagerView.tsx` passes `children` straight through a plain `Children.map` — **every page is mounted eagerly in JS on both platforms**. `offscreenPageLimit` is **[DOC]** documented as **Android-only** and affects only native view retention, not React mounting. So for N clips you get N mounted cells unless you window it yourself: render a placeholder for every index outside `selected ± 1`, driven off `onPageSelected`. That is a real chunk of hand-written machinery, and forgetting it means N players, not 3.

**[DOC] Two layout gotchas** from the README: "`flex:1` does not work for child views, please use `width: '100%', height: '100%'` instead", and on Android a child `View` with its own children needs `collapsable={false}`. **[DOC]** v8 also "rewrit[es] whole iOS codebase to use SwiftUI", so iOS behaviour in `8.0.2` is comparatively new code.

### Recommendation

**[INFERENCE — this is a judgement call, not a documented answer.]**

**Start with `FlatList` + `pagingEnabled`.** Zero new dependencies; every prop involved is specified in the RN 0.86 docs; it does not recycle component instances, so `useVideoPlayer`'s unmount-release _is_ the release path with nothing else scheduling it; and crucially its windowing props **actually work**, which is exactly the control FlashList declines to offer.

**[DOC] The props that matter, and the defaults that would hurt:**

| prop                    | default           | for this screen | why                                                                                                                                                                                                                     |
| ----------------------- | ----------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `windowSize`            | **21**            | `3`             | The default renders "the visible screen area plus up to 10 screens above and 10 below" — catastrophic when a screen is a video                                                                                          |
| `initialNumToRender`    | 10                | `2`             | Ten full-screen videos at mount                                                                                                                                                                                         |
| `maxToRenderPerBatch`   | 10                | `2`             | Keeps fling responsive                                                                                                                                                                                                  |
| `getItemLayout`         | —                 | provide it      | "efficient if you have fixed size items"; every item is exactly one screen tall                                                                                                                                         |
| `removeClippedSubviews` | `true` on Android | `false`         | The docs carry an explicit warning: "Using this property may lead to bugs (missing content)… use at your own risk", and note it "does not save significant memory because the views are not deallocated, only detached" |

**[DOC] One documentation gap to flag honestly:** RN's `pagingEnabled` entry says "This can be used for horizontal pagination" and the docs are **silent on vertical paging caveats**. Vertical support is not denied and `snapToAlignment` / `disableIntervalMomentum` both explicitly describe vertical behaviour — but if `pagingEnabled` misbehaves vertically, `snapToInterval` + `decelerationRate="fast"` is the documented alternative, and the docs say it "Overrides less configurable `pagingEnabled` prop".

Treat this as a decision to revisit **with a measurement**, not a permanent one:

- If scroll performance on a low-end Android device is the binding constraint → try **FlashList 2.0.2**, and read [#40376](https://github.com/expo/expo/issues/40376) first.
- If active-index detection proves fiddly or janky → **react-native-pager-view 8.0.2** for `onPageSelected` + `offscreenPageLimit`.

**[INFERENCE] This is a deliberate, documented deviation from the AGENTS.md "FlashList for long lists" rule, on the grounds that the rule optimises for a cost (per-row render) that is not the dominant cost here (per-player native memory and decoders).** If that reasoning is rejected, FlashList is workable — but the player pool must then be owned outside the list, and #40376 becomes a known risk we are accepting rather than one we have ruled out.

---

## 6. Determining "visible enough to autoplay", and the release path

**[DOC] expo-video has no opinion here.** The SDK 57 page has no play-when-visible, viewport, scroll or autoplay API. Searching the page for `visible`, `viewport`, `scroll` and `autoplay` turns up only unrelated hits. **Visibility-driven playback is entirely ours to build** — the docs neither offer nor bless a pattern.

### The RN mechanism

**[DOC]** RN's answer is `viewabilityConfig` + `onViewableItemsChanged` ([reactnative.dev/docs/flatlist](https://reactnative.dev/docs/flatlist)). The four config knobs, quoted:

- **`itemVisiblePercentThreshold`** — "considers the percent of the item that is visible, rather than the fraction of the viewable area it covers".
- **`viewAreaCoveragePercentThreshold`** — "Percent of viewport that must be covered for a partially occluded item to count as 'viewable', 0-100."
- **`minimumViewTime`** — "Minimum amount of time (in milliseconds) that an item must be physically viewable before the viewability callback will be fired. A high number means that scrolling through content without stopping will not mark the content as viewable."
- **`waitForInteraction`** — "Nothing is considered viewable until the user scrolls or `recordInteraction` is called after render."

**[DOC]** "At least one of the `viewAreaCoveragePercentThreshold` or `itemVisiblePercentThreshold` is required." **[SRC] The real constraint is stricter than the docs admit**: `packages/virtualized-lists/Lists/ViewabilityHelper.js` invariants on "Must set exactly one of itemVisiblePercentThreshold or viewAreaCoveragePercentThreshold" — **passing both throws**.

**[DOC] The sharp edge.** The config must be stable across renders:

> Error: Changing viewabilityConfig on the fly is not supported

The docs say this "needs to be done in the `constructor`" — i.e. **[INFERENCE]** in a function component, a module-level constant or a `useRef`, never an inline object literal.

**[SRC] The precise rules, from `FlatList.js` `componentDidUpdate` in react-native 0.86.2**, which asserts four separate invariants:

- `viewabilityConfig` — **deep-compared**. A structurally identical fresh object is fine; a changed value throws.
- `viewabilityConfigCallbackPairs` — **reference-compared**. Must be a stable ref.
- `onViewableItemsChanged` — only its **nullability** is frozen ("Changing onViewableItemsChanged nullability on the fly is not supported"). Its identity may change freely, so it does _not_ need a ref.

That last point is widely misreported; the callback is the one thing you are allowed to recreate.

**[DOC]** `viewabilityConfigCallbackPairs` exists for wanting **two thresholds at once** — "A specific `onViewableItemsChanged` will be called when its corresponding `ViewabilityConfig`'s conditions are met."

### What to actually use

**[INFERENCE]** For a full-screen pager, viewability is a slightly awkward fit: with one item filling the viewport, "viewable" is nearly binary, and the interesting question is _which single item is the active one_ — not _which items are visible_. Two candidate approaches:

1. **`viewabilityConfig` with a high `itemVisiblePercentThreshold` (~80) and a small `minimumViewTime` (~150–250 ms).** `minimumViewTime` is doing real work here: it is the documented way to stop a fast fling from starting playback on every clip it passes. Directly supported by both FlatList and FlashList.
2. **Index from scroll offset** — `Math.round(offsetY / itemHeight)` on `onMomentumScrollEnd` ("Called when the momentum scroll ends"). Deterministic and exactly one active index by construction. Two costs: it only fires when momentum ends, and a drag released without a fling produces no momentum at all, so `onScrollEndDrag` has to be handled too.

**[SRC] A real hazard in option (1) that the docs do not mention.** In `ViewabilityHelper.js`, `minimumViewTime` is implemented as a plain `setTimeout` that is **not cancelled when the item stops being viewable** — it re-checks at fire time instead. **[INFERENCE]** Under a fast fling across several full-screen pages this can queue several callbacks. Autoplay must therefore be gated on the _final settled_ index, not started on every callback — otherwise a fling starts and stops playback on each clip it passes.

**[INFERENCE]** Start with (1) — it is the documented path and works identically on both list candidates — but treat its output as a _proposal_ that is reconciled against the settled index, rather than as a direct play trigger. Ranked by determinism: `onPageSelected` (pager-view, one native event per settle) > `onMomentumScrollEnd` offset arithmetic > `onViewableItemsChanged` thresholds and timers. The RN docs do not compare these, and give no ordering guarantee between `onMomentumScrollEnd` and `onViewableItemsChanged`.

### The release path on scroll away

**[INFERENCE]** Three distinct levels, and conflating them is the bug:

| On                                | Do                                                            | Why                                                                                      |
| --------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Item leaves the active position   | `player.pause()` (and `currentTime = 0` if it should restart) | Cheap, instant, reversible on a swipe back                                               |
| Item leaves the ±1 preload window | Detach the player / drop its source                           | Stops buffering — **[SRC]** which otherwise continues even unmounted (changelog `1.1.1`) |
| Item leaves the render window     | Player released                                               | Frees the decoder                                                                        |

**[DOC]** If every player comes from `useVideoPlayer`, the third row is automatic: the player is "automatically cleaned up when the component is unmounted". That is the strongest argument for one-player-per-cell over a hand-rolled pool — it makes the release path structural rather than something to remember.

**[SRC] Pausing is not releasing.** Because an unmounted player keeps filling buffers, and because Android's `VideoManager` holds players strongly, a feed that only ever pauses will accumulate both network traffic and native memory. The middle row of that table is the one most likely to be forgotten.

---

## 7. Hazards specific to `expo-video@57.0.2`

Three findings that are not in the docs and that a plan built only from the docs would miss.

### 7.1 The iOS `AVPlayer` leak fix is **not** in SDK 57

**[SRC — verified independently]** PR [expo/expo#46453](https://github.com/expo/expo/pull/46453) "[video][ios] Add a workaround for leaks in `expo-video`" was **merged to `main` on 2026-07-08**, after the SDK 57 cut. The file it adds, `ios/OrientationAVPlayerViewControllerWrapper.swift`, returns **404 on the `sdk-57` branch** and **200 on `main`**. It does not appear in the `sdk-57` changelog. So the fix is absent from `57.0.2`.

The maintainer's own diagnosis of the underlying bug, quoted from the PR:

> the controller stores a strong reference to every `AVPlayer` that has ever been played inside of it until the controller is destroyed

It is caused by the `beginAppearanceTransition` call expo-video needs to make native controls work, and the PR notes the alternative was not available: "I have tried to find anything that would allow us to have the controls and fix the leak, but it was not possible."

**Be fair about the severity — the maintainer downplays it:** "this leak is pretty hard to come across in a real app - in the vast majority of use cases the player lives just as long or longer than the view controller."

**[INFERENCE] But that reassurance is precisely inverted for our use case.** The leak triggers when _one view controller sees several players over its lifetime_ — which is the definition of a recycled or pooled feed cell. A vertical pager is the atypical case the maintainer is excluding. **This is a reason to prefer non-recycling list behaviour on iOS, and a reason to measure memory on iOS specifically rather than assuming Android is the only risky platform.**

### 7.2 `loop: true` multiplies buffering

**[COMMUNITY]** expo/expo [#42688](https://github.com/expo/expo/issues/42688) — "Expo-video crashes with out of memory error when looping videos", labelled `Issue accepted`. `loop = true` maps to ExoPlayer's `REPEAT_MODE_ONE`, and a short clip with a large forward buffer buffers the same media several times over.

**[INFERENCE]** A feed of short clips with `loop: true` is exactly this shape. Pair looping with an explicitly lowered `preferredForwardBufferDuration` (default is `20` on Android) rather than leaving the default.

### 7.3 Android black-frame bugs are upstream and partly open

**[COMMUNITY]** [#39962](https://github.com/expo/expo/issues/39962) — "[expo-video] VideoView sometimes stays black instead of rendering first frame" is **OPEN**, `Issue accepted`, `Upstream: ExoPlayer`, reproduced by an Expo maintainer in a plain native project and filed upstream at `androidx/media#2809`. No view reuse is required to hit it.

**[INFERENCE]** A feed cannot distinguish this from its own bugs by eye. `onFirstFrameRender` plus the existing `thumbnail` poster is the mitigation: if the first frame never arrives, the user sees the poster instead of black.

---

## Recommended starting shape

**[INFERENCE] — the whole of this section. Nothing here is documented; it is our reading of the evidence above, to be validated by building and measuring.**

1. **Source format: progressive MP4**, not HLS. Caching then works on both platforms (question 3); HLS on iOS gets none. `db.json`'s `featuredVideos` entries have no media URL yet, so this is still free to decide.
2. **`FlatList` + `pagingEnabled`**, with `getItemLayout`, `windowSize={3}`, `initialNumToRender={2}`, `maxToRenderPerBatch={2}`, `removeClippedSubviews={false}`. No new dependency; revisit with a measurement, not a preference.
3. **3 live players** — previous, current, next — via `useVideoPlayer` per cell so release is structural. Verify the number on a low-end Android device; nothing documents it.
4. **Preload depth 1**, leaning on the documented behaviour that an unattached player still fills its buffers.
5. **`bufferOptions` explicitly set**, with `preferredForwardBufferDuration` well below the Android default of 20s.
6. **`useCaching: true`** on every source, given MP4.
7. **Active index from `viewabilityConfig`** — `itemVisiblePercentThreshold` ~80 (and _not_ `viewAreaCoveragePercentThreshold`; setting both throws), `minimumViewTime` ~200ms — with the config hoisted to a module constant, and playback gated on the settled index rather than started on every callback.
8. **`surfaceType="textureView"` on Android** if the documented overlapping-`cover` artefact appears; measure the power/performance cost before making it unconditional.
9. **`muted` by default**, `nativeControls={false}`, `contentFit="cover"`, thumbnail poster swapped on `onFirstFrameRender`.

---

## Open questions and known uncertainty

Stated plainly, because several of these cannot be closed by reading:

1. **The safe concurrent-player count is genuinely unknown.** Not in the docs, not in the changelog, not in the source, and no expo/expo issue establishes it. Android's hardware-decoder ceiling is real but expo-video is entirely silent on it — no cap, no error, no guidance. **Only measurement on a low-end Android device will answer this**, and every number in this document that depends on it (the "3 players" budget, preload depth 1) is a starting hypothesis.
2. **Whether the iOS leak (7.1) actually bites in our shape.** The mechanism is verified and the fix is verifiably absent from 57.0.2; the practical impact for a pager is inference. Worth a deliberate memory profile on iOS before committing to an architecture.
3. **Whether HLS segments are cached on Android.** The Android cache sits at the `DataSource` layer beneath the media-source factory, which structurally suggests all bytes flow through it — but this is not documented, and the docs only ever exclude HLS _on iOS_. Moot if we choose MP4.
4. **Whether one `AVPlayer` in several `AVPlayerViewController`s works on iOS.** The source shows iOS has no detach step where Android does, so the Android caveat is genuinely Android-only — but Apple does not document sharing a player across view controllers, and this was not tested. **Do not build on it.**
5. **[#40376](https://github.com/expo/expo/issues/40376) (FlashList + player pool freezing on Android) is unresolved, not disproven.** It was closed by a stale bot with no maintainer reply. It is the closest published report to the architecture in question.
6. **The FlashList v2 / full-screen-paging combination is undocumented.** Paging works by `ScrollViewProps` inheritance; no FlashList doc discusses full-screen items or endorses the use case, and its windowing props are explicit no-ops so the live-cell count cannot be pinned.
7. **Whether `pagingEnabled` behaves correctly for _vertical_ paging is not addressed by the RN docs**, whose only sentence on the prop describes horizontal pagination. `snapToInterval` + `decelerationRate="fast"` is the documented fallback, but which one feels right is an empirical question.
8. **New Architecture compatibility for expo-video is assumed, not stated.** The SDK 57 page never mentions New Architecture, Fabric or bridgeless. It is a first-party module shipped in Expo Go on a New-Arch-by-default SDK, so it is surely fine — but no document says so.

---

## Sources

- SDK 57 versioned docs: <https://docs.expo.dev/versions/v57.0.0/sdk/video/> — sections `#using-the-videoplayer-directly`, `#caching-videos`, `#managing-the-cache`, `#preloading-videos`, `#videosource`, `#known-issues`
- React Native 0.86 docs: <https://reactnative.dev/docs/0.86/flatlist>, <https://reactnative.dev/docs/0.86/virtualizedlist>, <https://reactnative.dev/docs/0.86/scrollview>, <https://reactnative.dev/docs/0.86/optimizing-flatlist-configuration>; source `react-native@0.86.2` `Libraries/Lists/FlatList.js`, `packages/virtualized-lists/Lists/ViewabilityHelper.js`
- expo-video source, `expo/expo` branch `sdk-57`: `packages/expo-video/` — `src/VideoPlayer.tsx`, `src/VideoPlayer.types.ts`, `src/VideoView.types.ts`, `src/VideoModule.ts`, `android/.../video/VideoCache.kt`, `android/.../video/managers/VideoManager.kt`, `android/.../video/player/VideoPlayer.kt`, `ios/VideoManager.swift`, `ios/Cache/VideoCacheManager.swift`, `CHANGELOG.md`
- Version pin: `node_modules/expo/bundledNativeModules.json` (`expo@57.0.9`), cross-checked against the `sdk-57` branch copy
- FlashList: `Shopify/flash-list` `README.md`, `src/FlashListProps.ts`, `src/recyclerview/RecyclerView.tsx`, `src/recyclerview/viewability/ViewabilityHelper.ts`, `src/native/config/PlatformHelper.*.ts`; <https://shopify.github.io/flash-list/docs/usage>, <https://shopify.github.io/flash-list/docs/recycling>, <https://shopify.github.io/flash-list/docs/known-issues>, <https://shopify.github.io/flash-list/docs/v2-changes>
- react-native-pager-view: `callstack/react-native-pager-view` `src/PagerViewNativeComponent.ts`, `src/PagerView.tsx`, `README.md`
- Reanimated 4: <https://docs.swmansion.com/react-native-reanimated/docs/scroll/useScrollOffset/>
- expo/expo issues and PRs: [#35012](https://github.com/expo/expo/issues/35012), [#39962](https://github.com/expo/expo/issues/39962), [#40376](https://github.com/expo/expo/issues/40376), [#42688](https://github.com/expo/expo/issues/42688), [#46453](https://github.com/expo/expo/pull/46453)
