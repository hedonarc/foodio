# Can a Clip and its attribution ship in one share payload?

Research for [#33](https://github.com/hedonarc/foodio/issues/33) (parent: [#25](https://github.com/hedonarc/foodio/issues/25), map: [#19](https://github.com/hedonarc/foodio/issues/19)). Establishes what is **documented** for SDK 57, what the **source proves**, and what is **inference** — for handing a Clip's MP4 plus its attribution text to the OS share sheet.

Every claim below is labelled:

| Label           | Meaning                                                                                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[DOC]**       | Stated in the SDK 57 versioned docs. Cited with anchor.                                                                                                                                 |
| **[SRC]**       | Proven by source: `expo/expo` on the `sdk-57` branch, or `react-native@0.86.2` as installed in this repo. Cited with file path. Also used for direct measurements of the actual assets. |
| **[COMMUNITY]** | Issue tracker, vendor docs or third-party practice. Not a guarantee.                                                                                                                    |
| **[INFERENCE]** | Our reasoning from the above. Not documented. Treat as a hypothesis to verify on a device.                                                                                              |

Primary sources: <https://docs.expo.dev/versions/v57.0.0/sdk/sharing/>, <https://docs.expo.dev/versions/v57.0.0/sdk/filesystem/>, `github.com/expo/expo` at branch `sdk-57`, and `node_modules/react-native@0.86.2` in this repo.

---

## The answer, first

**No.** And the question has two layers, which must not be collapsed — the answer is different at each, and both are negative.

**Layer 1 — can the API _send_ both?** Platform-dependent.

| Platform    | Video **and** caption in one share action? | Via what                                                                               |
| ----------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| **iOS**     | **Yes**                                    | RN `Share.share({ message, url: fileUri })` — `activityItems = [NSString, file NSURL]` |
| **Android** | **No.** Pick one.                          | `expo-sharing` → video only. RN `Share` → text only.                                   |

This half is settled at the source level, not inferred. See [§2](#2-android-the-two-apis-are-each-missing-the-other-half) for the Android proof, [§4](#4-ios-the-api-sends-both) for the iOS mechanism, and [§3](#3-the-android-escape-hatches-and-why-they-fail) for escape hatches checked and rejected.

**Layer 2 — do the target apps _render_ both?** **[COMMUNITY] Reportedly not, and this is where iOS's "yes" stops being a yes.** Delivering two `activityItems` guarantees the activity receives both; it guarantees nothing about what the activity does with them, and the reports for our three target apps say one item is silently dropped:

| Receiving app | iOS, given `[text, video file]`                                                                              | Source                                                                                                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Messages**  | **Video wins, text is dropped.** (Image + text: both survive — video specifically is the broken case.)       | [Apple forum 727907](https://developer.apple.com/forums/thread/727907), Apr 2023, **0 replies, never answered**                                                                                                                                                                   |
| **WhatsApp**  | **Text wins, video is dropped.**                                                                             | [plus_plugins#261](https://github.com/fluttercommunity/plus_plugins/issues/261) (2021, files); [react-native-share#1487](https://github.com/react-native-share/react-native-share/issues/1487) (2023-11-23, **`video/mp4` specifically**) — closed by a stale bot, never answered |
| **Instagram** | **Caption discarded by design since 2015.** Meta's docs contain no caption field for feed or stories at all. | [InstagramPlugin#44](https://github.com/vstirbu/InstagramPlugin/issues/44) (2015); absence across <https://developers.facebook.com/docs/instagram-platform/sharing-to-feed>                                                                                                       |

**So the honest headline: a playable video and its caption cannot be relied on to arrive together in any of the three target apps, on either platform.** Android cannot even send both. iOS can send both, and then WhatsApp drops the video while Messages drops the text — note that these two fail in _opposite directions_, so there is not even a single "safe" item to prefer.

**[INFERENCE]** The Layer-2 evidence is **[COMMUNITY]**, not documentation, and the strongest reports are 2021–2023. It is the best evidence that exists — no vendor documents this — but it is exactly the kind of claim that must be re-tested on a device before anything is built on it. That test is item 1 in [§12](#12-what-could-not-be-settled-by-reading).

**What it means for [#25](https://github.com/hedonarc/foodio/issues/25):** the decision was "the payload is the video itself, with attribution in the accompanying text." Android cannot express that payload with first-party packages at all. iOS can express it, and the receiving apps then appear to discard half of it. Since attribution-in-text was the corrected fallback _after_ watermarking was ruled out, and watermarking remains impossible in SDK 57 ([§7](#7-watermarking-still-no-and-now-for-a-documented-reason)), **a shared clip may well carry no attribution anywhere, on either platform**. That is not a complication of the decision — it removes its second half. Details in [§8](#8-what-this-does-to-25).

---

## 1. Versions and what installing costs

**[SRC]** `npx expo install` on this repo resolves against `node_modules/expo/bundledNativeModules.json` (from the installed `expo@57.0.9`):

| package            | SDK 57 pin | npm `latest` today | currently a dependency? |
| ------------------ | ---------- | ------------------ | ----------------------- |
| `expo-sharing`     | `~57.0.8`  | 57.0.8             | **no**                  |
| `expo-file-system` | `~57.0.1`  | 57.0.1             | **no**                  |

Both ranges resolve to exactly the current `latest`. **[DOC]** Both are **included in Expo Go** — the sharing page lists `platforms: ['android', 'ios', 'web', 'expo-go']`, the filesystem page lists Android, iOS, tvOS and Expo Go. No development build is needed for the send path.

**[SRC]** `expo-sharing`'s SDK 57 CHANGELOG is unusually quiet: every release from `57.0.0` through `57.0.8` reads "_This version does not introduce any user-facing changes._" Likewise `expo-file-system` `57.0.0` and `57.0.1`. **[INFERENCE]** The send-side API is stable and unlikely to move under us; the churn in this package during SDK 57 was all on the _receiving_ side (share extensions), which we do not use.

**[DOC] `expo-sharing`'s config plugin is for receiving, not sending.** Its options are `ios.enabled` / `ios.activationRule` / `ios.appGroupId` (adds a **Share Extension target**) and `android.enabled` / `android.singleShareMimeTypes` (adds an **`intent-filter`** so other apps can share _into_ Foodio). All default to disabled. **[INFERENCE]** For our use case — sharing _out_ — the plugin should be left entirely unconfigured; adding it would put Foodio in other apps' share sheets, which nobody asked for.

---

## 2. Android: the two APIs are each missing the other half

This is the load-bearing section. Both halves are proven at the source level.

### 2a. `expo-sharing.shareAsync` sends the file and **no text**

**[DOC]** The documented signature is `Sharing.shareAsync(url, options)`, where `url` is "Local file URL to share" and `options` is `SharingOptions`.

**[SRC]** `SharingOptions` in full (`packages/expo-sharing/src/Sharing.types.ts`) is exactly four fields:

```ts
export type SharingOptions = {
  mimeType?: string; // @platform android
  UTI?: string; // @platform ios
  dialogTitle?: string; // @platform android, web
  anchor?: { x?; y?; width?; height? }; // @platform ios
};
```

**[DOC — absence]** There is no `message`, `text`, `caption`, `subject` or `body` field, in the type or anywhere on the SDK 57 docs page. The docs page's API section is generated from this same type, so doc and source cannot disagree.

**[SRC]** And the Android native module never puts text on the intent (`packages/expo-sharing/android/src/main/java/expo/modules/sharing/SharingModule.kt`):

```kotlin
private fun createSharingIntent(uri: Uri, mimeType: String?) =
  Intent(Intent.ACTION_SEND).apply {
    putExtra(Intent.EXTRA_STREAM, uri)
    setTypeAndNormalize(mimeType)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
  }
```

`EXTRA_STREAM` only. `EXTRA_TEXT` is never set, and `dialogTitle` goes to `Intent.createChooser(...)` — the chooser's own header, which the receiving app never sees.

**[SRC]** Two further constraints from the same file, worth knowing before designing around it:

- **Remote URLs are rejected outright.** `getLocalFileFoUrl` throws `InvalidArgumentException` unless `uri.scheme == "file"`: _"Only local file URLs are supported (expected scheme to be 'file', got '…')"_. A Pexels `https://` URL cannot be passed through. The download in [§5](#5-the-download-path) is mandatory, not an optimisation.
- **The file must be inside Expo's readable scope.** `isAllowedToRead` consults `appContext.filePermission` for a `READ` permission on the path.

**[SRC]** The `file://` path also has to be resolvable by expo-sharing's own `FileProvider`. `packages/expo-sharing/android/src/main/res/xml/sharing_provider_paths.xml` declares:

```xml
<external-path name="expo_external_files" path="." />
<files-path    name="expo_files"          path="." />
<cache-path    name="cached_expo_files"   path="." />
```

`cache-path` is covered, so a file written to `Paths.cache` is shareable. **[INFERENCE]** This is the pairing to use: `Paths.cache` satisfies both the FileProvider path config and the `filePermission` scope check, and is the directory the OS is allowed to reclaim.

### 2b. RN `Share.share` sends the text and **never a file**

**[SRC]** `react-native@0.86.2`, `Libraries/Share/Share.js`. On Android the JS layer **drops `content.url` before it ever reaches native**:

```js
if (Platform.OS === 'android') {
  const newContent = {
    title: content.title,
    message: typeof content.message === 'string' ? content.message : undefined,
  };
  return NativeShareModule.share(newContent, options.dialogTitle)
```

`url` is not copied into `newContent`. **[SRC]** The TurboModule spec agrees — there is no `url` in the Android contract at all (`src/private/specs_DEPRECATED/modules/NativeShareModule.js`):

```js
+share: (content: {title?: string, message?: string}, dialogTitle?: string) => Promise<{action: string}>;
```

**[SRC]** And the native module hardcodes a text MIME type (`ReactAndroid/src/main/java/com/facebook/react/modules/share/ShareModule.kt`):

```kotlin
val intent = Intent(Intent.ACTION_SEND)
intent.setTypeAndNormalize("text/plain")
if (content.hasKey("title"))   intent.putExtra(Intent.EXTRA_SUBJECT, content.getString("title"))
if (content.hasKey("message")) intent.putExtra(Intent.EXTRA_TEXT,    content.getString("message"))
```

Type is `text/plain`, unconditionally. `EXTRA_STREAM` is never set. The class doc comment says so plainly: _"Open a chooser dialog to send text content to other apps."_

**[SRC]** RN's own JSDoc on `Share.share` documents the split without drawing the conclusion: under `#### iOS` it lists "`url` - a URL to share"; under `#### Android` it lists only `title` and `message`. The `ShareContent` Flow type permits `{message, url}` on every platform, so **`url` is silently ignored on Android — there is no error, no warning, and no runtime signal that half the payload vanished.** **[INFERENCE]** This is the trap: `Share.share({ message, url })` will look correct in review, run without error on Android, and quietly deliver a caption with no video.

### 2c. Verdict for Android

**[INFERENCE]** With first-party packages only, Android forces a binary choice per share action:

- `Sharing.shareAsync(fileUri, { mimeType: 'video/mp4' })` → the clip plays, **nothing identifies Foodio or the restaurant**.
- `Share.share({ message })` → the attribution arrives, **there is no video** — just a `https://videos.pexels.com/...mp4` URL in a text bubble, which is the "inert link" outcome #25 explicitly rejected.

You cannot fire both in one gesture either: **[SRC]** `SharingModule.shareAsync` guards on a `pendingPromise` and throws `SharingInProgressException` if a share is already open, and each call presents its own chooser. Two sequential share sheets is two user decisions, not one share.

---

## 3. The Android escape hatches, and why they fail

Three routes were checked before accepting the finding.

### `expo-intent-launcher` — cannot build the intent

**[DOC]** Android-only, in Expo Go, `startActivityAsync(activityAction, params)` with `params.extra?: Record<string, any>`. On paper you could hand-roll `ACTION_SEND` with both extras.

**[SRC]** You cannot (`packages/expo-intent-launcher/android/src/main/java/expo/modules/intentlauncher/IntentLauncherModule.kt`). Three independent blockers:

1. **`EXTRA_STREAM` must be a `Parcelable` `Uri`.** The module funnels every extra through `intent.putExtras(valuesList.toBundle())`, where `toBundle()` is `bundleOf(*this.toList().toTypedArray())`. A JS string lands in the `Bundle` as a `String`. A receiving app calling `getParcelableExtra<Uri>(EXTRA_STREAM)` gets `null`. The only type coercion in the module is `Double → Int/Long`; there is no `String → Uri` case.
2. **No URI permission grant.** `expo-sharing` explicitly enumerates chooser targets and calls `context.grantUriPermission(packageName, contentUri, FLAG_GRANT_READ_URI_PERMISSION)` for each. `IntentLauncherModule` does none of this. Even a correctly-typed `content://` URI would hit a `SecurityException` in the receiver.
3. **No `FileProvider`, and no chooser.** It calls `startActivityForResult(intent, …)` on a bare intent — no `Intent.createChooser`.

**[INFERENCE]** `expo-intent-launcher` is not a workaround for this. Building the intent correctly requires native Kotlin, which means a config plugin or a patch — i.e. leaving the first-party surface entirely.

### `react-native-share` — a third-party native dependency

See [§8](#8-what-this-does-to-25). Summarised there with its version and New Architecture status.

### Two share sheets in a row

**[INFERENCE]** Rejected on product grounds, not technical ones. It doubles the taps, and the second sheet's target has no relationship to the first — the user can send the video to WhatsApp and the caption to Notes. A share flow that can desynchronise its own two halves is worse than shipping one half.

---

## 4. iOS: the API sends both

**[SRC]** `react-native@0.86.2`, `Libraries/Share/Share.js` → `NativeActionSheetManager.showShareActionSheetWithOptions({ message, url, subject, … })`, and `React/CoreModules/RCTActionSheetManager.mm` assembles **both** into one activity item array:

```objc
NSMutableArray<id> *items = [NSMutableArray array];
NSString *message = options.message();
NSURL *URL = [RCTConvert NSURL:options.url()];
…
if (message != nullptr) { [items addObject:message]; }
if (URL != nullptr) { … [items addObject:URL]; }
…
UIActivityViewController *shareController =
    [[UIActivityViewController alloc] initWithActivityItems:items applicationActivities:nil];
```

**[SRC]** `RCTConvert NSURL` (`React/Base/RCTConvert.mm`) does the right thing with a `file://` string — `[NSURL URLWithString:path]` returns a URL whose `scheme` is set, and it returns immediately on that branch. So `Share.share({ message: caption, url: 'file:///…/clip.mp4' })` yields `activityItems = [NSString, file NSURL]`. **Two items, one sheet, one user gesture.**

**[SRC]** Contrast `expo-sharing` on iOS (`packages/expo-sharing/ios/SharingModule.swift`), which builds the same controller with a **single** item:

```swift
let activityController = UIActivityViewController(activityItems: [url], applicationActivities: nil)
activityController.title = options.dialogTitle
```

**[INFERENCE]** Therefore on iOS, **RN's built-in `Share` is strictly more capable than `expo-sharing` for this use case** — it does everything `expo-sharing` does (a file `NSURL` in `activityItems`) plus the caption. `expo-sharing` earns its place on **Android**, where it is the only one of the two that can carry a file at all. That inverts the intuition that the Expo package is the richer one.

**[SRC]** One small iOS asymmetry worth noting: `options.subject` is set via `[shareController setValue:subject forKey:@"subject"]`, which mail activities pick up as the subject line. Not useful for WhatsApp/Messages, but it is the only other text channel.

**[INFERENCE]** What each receiving app _does_ with two items is its own decision — see [§9](#9-inline-rendering-and-what-the-clips-themselves-look-like). The API guarantees delivery of both items to the activity; it guarantees nothing about rendering.

---

## 5. The download path

`expo-sharing` requires a `file://` URI ([§2a](#2a-expo-sharingshareasync-sends-the-file-and-no-text)), and Clips are remote Pexels URLs. So a download is unavoidable on both platforms.

### Which API in SDK 57

**[DOC]** SDK 57's `expo-file-system` is the **class-based API** (`File`, `Directory`, `Paths`). The old functional API still exists at `expo-file-system/legacy`. **[INFERENCE]** Use the modern one; `legacy` is a migration shim and AGENTS.md's "avoid unnecessary abstractions" argues against introducing a deprecated import path in new code.

**[DOC/SRC]** The one-shot form (`packages/expo-file-system/src/File.ts`):

```ts
static downloadFileAsync: (
  url: string,
  destination: Directory | File,
  options?: DownloadOptions
) => Promise<File>;
```

**[SRC]** `DownloadOptions` (`src/NetworkTasks.types.ts`) is `{ headers?, idempotent?, onProgress?, signal? }`. `signal` is a standard `AbortSignal` — **[INFERENCE]** wire it to the screen's unmount so a user who backs out mid-share does not leave a download running.

**[DOC/SRC]** For progress UI or pause/resume, `File.createDownloadTask(url, destination, { onProgress })` returns a task you start with `downloadAsync()`. **[INFERENCE]** For ~3 MB, `downloadFileAsync` with a spinner is enough; a progress bar is over-engineering, but the share button must be disabled while it runs, because on a poor connection this is seconds of dead time after a tap.

### Failure behaviour differs by platform — this is documented and it matters

**[DOC/SRC]** From the `downloadFileAsync` doc comment:

> On Android, the response body streams directly into the target file. If the download fails after it starts, a partially written file may remain at the destination. On iOS, the download first completes in a temporary location and the file is moved into place only after success, so no file is left behind when the request fails.

**[INFERENCE]** So on Android a failed download can leave a **truncated MP4 sitting at the exact path you were about to share**. If the code does "download if absent, else share the cached file", the next share hands a corrupt file to WhatsApp. Either delete the destination in a `catch`, or use `idempotent: true` so a retry overwrites rather than rejecting with `DestinationAlreadyExists`.

**[DOC/SRC]** Non-2xx responses reject with `UnableToDownload` including the status code, and no file is created.

### Where it lands

**[DOC]** `Paths.cache` is "a place to store files that can be deleted by the system when the device runs low on storage"; `Paths.document` is "safe from being deleted by the system".

**[SRC]** Both resolve to the app's own sandboxed directories, not shared storage:

|        | Android                                                                                              | iOS                                                                                         |
| ------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| source | `FileSystemModule.kt` → `appContext.cacheDirectory`, exposed as `Uri.fromFile(cacheDirectory) + "/"` | `FileSystemModule.swift` → `appContext?.config.cacheDirectory`, exposed as `absoluteString` |
| shape  | `file:///data/user/0/<pkg>/cache/…`                                                                  | `file:///…/Library/Caches/…`                                                                |

Both are `file://` URIs, which is what `shareAsync` demands.

**[SRC]** Note the SDK 56 changelog entry, still relevant in Expo Go: _"[Android] In Expo Go, `Paths.cache` and `Paths.document` are now pointing to experience-isolated directories."_

### Cleanup

**[SRC]** `File` exposes a synchronous `delete()`, plus `exists`, `size`, `md5` and `info()` (`src/internal/NativeFileSystem.types.ts`). `Directory.delete()` is recursive.

**[INFERENCE]** The recommended shape:

- Write to a dedicated subdirectory, `new Directory(Paths.cache, 'clip-share')`, so cleanup is one recursive `delete()` and can never touch anything else.
- Name deterministically by clip id (`${clip.id}.mp4`) so a re-share of the same clip is free.
- **Do not delete in a `finally` immediately after `shareAsync` resolves.** On iOS `shareAsync`/`Share.share` resolve when the sheet is _dismissed_, and the receiving extension may still be reading the file. Sweep the directory on next app start instead, or on the next share.
- Do not use `Paths.document`. A share cache in a directory the OS may not reclaim is a leak that grows at ~3 MB per clip shared.

**[SRC]** `Paths.availableDiskSpace` and `Paths.totalDiskSpace` exist if a guard is ever wanted; **[INFERENCE]** unnecessary at this size.

### Can we reuse `expo-video`'s cache instead of re-downloading?

**[SRC]** No. On Android the video cache is a media3 `SimpleCache` with a `LeastRecentlyUsedCacheEvictor` and a `StandaloneDatabaseProvider` in `ExpoVideoCache/<uuid>` (`packages/expo-video/android/.../VideoCache.kt`); on iOS it is a bespoke `AVAssetResourceLoader` interception under `packages/expo-video/ios/Cache/`. **[INFERENCE]** Neither stores a standalone playable `.mp4` at a stable path — media3's on-disk format is indexed cache _spans_, not the original file — and neither exposes a public API to resolve a source URL to a file path. So a shared clip costs a **second** download of bytes the player may already hold. At ~3 MB that is acceptable; it is worth knowing it is not free.

### Cost

**[SRC — measured against the actual assets]** Probed three clips from the shortlist in [`playable-clips.md`](https://github.com/hedonarc/foodio/blob/research/playable-clips/docs/research/playable-clips.md) over HTTP range requests:

| file                            | HTTP | content-type | size    | accept-ranges |
| ------------------------------- | ---- | ------------ | ------- | ------------- |
| `7929034-hd_720_1280_24fps.mp4` | 200  | `video/mp4`  | 2.61 MB | bytes         |
| `6353432-hd_720_1280_60fps.mp4` | 200  | `video/mp4`  | 1.45 MB | bytes         |
| `5288344-hd_720_1280_30fps.mp4` | 200  | `video/mp4`  | 3.20 MB | bytes         |

So ~1.5–3.3 MB per share, matching the ticket's ~3 MB assumption. **[INFERENCE]** On a slow connection that is a multi-second delay between tapping Share and the sheet appearing, and the UI has to own that gap — a share sheet that appears three seconds after the tap reads as a broken button.

---

## 6. What each package adds to the manifest

### Android

**[SRC]** `packages/expo-sharing/android/src/main/AndroidManifest.xml` — **no permissions at all**:

```xml
<application>
  <provider android:name=".SharingFileProvider"
            android:authorities="${applicationId}.SharingFileProvider"
            android:exported="false" android:grantUriPermissions="true">
    <meta-data android:name="android.support.FILE_PROVIDER_PATHS"
               android:resource="@xml/sharing_provider_paths"/>
  </provider>
</application>
<queries>
  <intent>
    <!-- Required for file sharing if targeting API 30 -->
    <action android:name="android.intent.action.SEND" />
    <data android:mimeType="*/*" />
  </intent>
</queries>
```

A non-exported `FileProvider` and a `<queries>` element for package-visibility (Android 11+). **[INFERENCE]** Neither is a user-visible permission and neither triggers a Play Console disclosure.

**[SRC]** `packages/expo-file-system/android/src/main/AndroidManifest.xml` — three permissions and a second `FileProvider`:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"  android:maxSdkVersion="32" />
```

**[SRC] In this app that is a no-op.** The manifest `npx expo prebuild` currently generates at `android/app/src/main/AndroidManifest.xml` — before either package is installed — already declares all three:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"  android:maxSdkVersion="32" tools:replace="android:maxSdkVersion"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" tools:replace="android:maxSdkVersion"/>
```

**[INFERENCE]** So adding both packages changes the app's declared Android permission set by **nothing**. All three are capped at `maxSdkVersion="32"`, so on Android 13+ they are not even requested. Both `<provider>` entries are `exported="false"`. There is no runtime permission prompt anywhere on this path — `Paths.cache` is app-private storage, which needs no permission on any API level.

### iOS

**[SRC]** `expo-sharing` ships **no** `PrivacyInfo.xcprivacy` and adds no `Info.plist` keys on the send path. **[SRC]** `expo-file-system` ships a privacy manifest declaring `NSPrivacyTracking: false`, no collected data types, and two required-reason API categories — `FileTimestamp` (`0A2A.1`, `3B52.1`) and `DiskSpace` (`E174.1`, `85F4.1`). **[INFERENCE]** These are Apple's standard declarations, already satisfied by the shipped manifest; nothing needs adding to `app.json`.

**[DOC]** `expo-file-system`'s config plugin options `supportsOpeningDocumentsInPlace` and `enableFileSharing` add `LSSupportsOpeningDocumentsInPlace` / `UIFileSharingEnabled` — these expose the app's Documents directory in the Files app. **[INFERENCE]** Not wanted here, and not needed: leave the plugin off.

---

## 7. Watermarking: still no, and now for a documented reason

#25 already corrected the "watermarked" label. This confirms it against SDK 57 rather than from memory.

**[DOC]** The SDK 57 API index lists no video editing, transcoding, compositing or frame-writing library. The media-adjacent packages are `expo-video`, `expo-video-thumbnails`, `expo-camera`, `expo-image-manipulator`, `expo-media-library`, `expo-file-system`, `expo-sharing`. **[DOC — absence]** `expo-gl` and `expo-av` are not in the SDK 57 index at all, which removes the two routes people usually reach for (GL surface capture, and `expo-av`'s recording path).

- **[DOC]** `expo-image-manipulator` operates on images. It cannot open or write a video.
- **[DOC]** `expo-video-thumbnails` `getThumbnailAsync(sourceFilename, options)` returns `{ uri, width, height }` — **one still image**. It is also deprecated in SDK 57 in favour of `generateThumbnailsAsync` from `expo-video`. Either way the output is a frame, and there is no API anywhere in the SDK to write frames back into a container.
- **[COMMUNITY]** `ffmpeg-kit-react-native` is `6.0.2` and **marked deprecated on npm**: _"Package no longer supported."_ This is npm registry metadata, not a rumour.

**[INFERENCE]** So burning attribution into the pixels requires writing a native module around `AVMutableVideoComposition` (iOS) and MediaCodec/`Transformer` (Android) — two platform implementations, a real transcode of every shared clip, and a large native dependency. Ruled out, and it is now a documented ruling rather than an assumed one.

**[INFERENCE]** There is one non-obvious consequence, and it is the sharpest thing in this document. If attribution can only ride in text, and **Android cannot carry text alongside the file** ([§2](#2-android-the-two-apis-are-each-missing-the-other-half)), then on Android there is **no attribution channel whatsoever** — not in the pixels, not in the text. An Android user sharing a Foodio clip sends an anonymous, unbranded food video.

---

## 8. What this does to #25

#25's decision: _"The share payload is the video itself, not a link… Attribution rides in the accompanying text, not in the pixels."_

**What survives.** The iOS half works exactly as described, and better than #25 assumed — RN's built-in `Share` delivers file plus caption in one sheet with no extra dependency beyond `expo-file-system` for the download. The "recipient needs no app, no install, no working link" argument holds on iOS.

**What does not.** On Android, with first-party packages, the two-part payload does not exist. #25 flagged this as a possibility ("may not be expressible identically on both platforms"); it is now confirmed as **not expressible at all**, and the gap is total rather than cosmetic. Combined with [§7](#7-watermarking-still-no-and-now-for-a-documented-reason), Android shares carry **zero attribution** — no watermark, no caption, no deep link, no app name. The acquisition loop that justified choosing "share the video" over "share a link" runs on Android with nothing in it that points back to Foodio.

**Three ways forward.** None is free; the choice belongs to #25, not to this ticket.

1. **Accept the asymmetry.** iOS gets video + attribution; Android gets a bare video. Cheapest, and it is the only option that stays inside first-party packages. **[INFERENCE]** Also the least defensible, because it makes the acquisition argument platform-dependent without saying so anywhere.
2. **Add `react-native-share`.** **[SRC]** `react-native-share@12.3.1`, `android/src/main/java/cl/json/social/ShareIntent.java` at tag `v12.3.1`, does set both on one intent:
   ```java
   this.getIntent().setType(this.fileShare.getType());
   this.getIntent().setClipData(clip);
   this.getIntent().putExtra(Intent.EXTRA_STREAM, uriFile);
   this.getIntent().addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
   if (!TextUtils.isEmpty(message)) {
     this.getIntent().putExtra(Intent.EXTRA_TEXT, message);
   }
   ```
   **This is the important structural correction to the whole framing: Android the platform is not the blocker.** `ACTION_SEND` accepts `EXTRA_STREAM` and `EXTRA_TEXT` together; RN and `expo-sharing` simply decline to set both. The gap is in our libraries, not in Android. The cost is a third-party native dependency on the acquisition path — see [§9](#9-inline-rendering-and-what-the-clips-themselves-look-like) for whether receiving apps then honour `EXTRA_TEXT`, which is the part reading cannot settle.
3. **Put the attribution where the file name is.** **[INFERENCE]** The one attribution channel that survives on both platforms is the **filename**, since `shareAsync` shares whatever file you hand it. `Foodio-Nandos-peri-peri-wings.mp4` is not a caption, but it is not nothing, and it costs one line in the download destination. Weak, free, and worth doing regardless of which option above is chosen.

---

## 9. Inline rendering, and what the clips themselves look like

Inline playback is the entire acquisition argument, and it is the one part of this question that no Expo or React Native document can answer — it is decided by the **receiving** app, from the bytes and the MIME type it is handed.

### The clips are in the right shape for it

**[SRC — measured against the actual assets]** The shortlisted Pexels clips were probed over HTTP range requests and their top-level MP4 atoms walked:

| file                            | top-level atoms                     | layout        | brand                          | codecs                 |
| ------------------------------- | ----------------------------------- | ------------- | ------------------------------ | ---------------------- |
| `7929034-hd_720_1280_24fps.mp4` | `ftyp(32) moov(3907) mdat(2734888)` | **faststart** | `mp42` (`mp42 mp41 isom avc1`) | `avc1`, no audio track |
| `6353432-hd_720_1280_60fps.mp4` | `ftyp(32) moov(8846) mdat(1515659)` | **faststart** | `mp42`                         | `avc1`, no audio track |
| `5288344-hd_720_1280_30fps.mp4` | `ftyp(32) moov(6637) mdat(3346169)` | **faststart** | `mp42`                         | `avc1`, no audio track |

Three things follow.

1. **`moov` precedes `mdat` in every file** — these are already faststart. **[INFERENCE]** A receiving app or thumbnailer can read duration and dimensions from the first few kilobytes without seeking to the end, which is the usual reason a shared MP4 renders as a grey file card instead of a player.
2. **H.264/AVC in an `mp42` container** — **[INFERENCE]** the most broadly accepted combination there is, and what any consumer messenger expects.
3. **No audio track.** No `mp4a` sample entry in any probed file. **[INFERENCE]** Harmless for playback, but worth knowing before someone reports "the shared video has no sound" as a bug in our pipeline. It is the source material.

**[SRC]** `Content-Type` on the wire is `video/mp4` and the CDN honours `Accept-Ranges: bytes`.

**[INFERENCE]** On the share side, set `mimeType: 'video/mp4'` explicitly on Android rather than relying on `expo-sharing`'s fallback. **[SRC]** Its fallback chain is `params.mimeType ?: URLConnection.guessContentTypeFromName(fileToShare.name) ?: "*/*"` — so a destination filename without a `.mp4` extension silently degrades the intent to `*/*`, which changes which apps appear in the chooser and how they treat the payload. On iOS the equivalent lever is `UTI` (`public.mpeg-4`), though **[INFERENCE]** iOS generally infers correctly from the extension.

### What the receiving apps do with it

_Pending — see [§12](#12-what-could-not-be-settled-by-reading)._

---

## 10. Recommended shape, if #25 stands

**[INFERENCE]** Everything in this section is our reasoning, not documentation.

- **Install `expo-file-system` unconditionally.** The download is required on both platforms and there is no alternative. Zero new permissions in this app ([§6](#6-what-each-package-adds-to-the-manifest)).
- **Branch the share call by platform.** These are genuinely different APIs, not one API with a flag:
  - **iOS** → RN's built-in `Share.share({ message, url })`. **Do not use `expo-sharing` on iOS** — it is strictly less capable here, and reaching for it costs the caption.
  - **Android** → `Sharing.shareAsync(uri, { mimeType: 'video/mp4' })`, accepting no caption, unless #25 accepts `react-native-share`.
- **Put that branch behind one function** in the feature's services — `shareClip(clip)` — so exactly one file knows the platforms diverge. Per AGENTS.md that is `src/features/discovery/services/`.
- **Download to `new Directory(Paths.cache, 'clip-share')`**, named `${clip.id}.mp4`, with `idempotent: true`. Sweep the directory on app start, not in a `finally` after the sheet closes.
- **Do not swallow the download failure.** AGENTS.md is explicit about this, and it is the likeliest failure on this path — a share button that silently does nothing on a bad connection is the worst outcome available.
- **Compose the caption from `clip.author.kind`**, which #25 established as the trust discriminator. `clipSchema` in `src/features/discovery/types/clip.types.ts` already carries `restaurantName`, `caption` and the discriminated `author`, so nothing new needs modelling. On iOS that text is the payload's second half; on Android it currently has nowhere to go, which is the finding.

---

## 11. Summary of claims by label

| #   | Claim                                                                   | Label                   |
| --- | ----------------------------------------------------------------------- | ----------------------- |
| 1   | `SharingOptions` has no message/text field                              | [DOC] + [SRC]           |
| 2   | expo-sharing Android sets `EXTRA_STREAM` only, never `EXTRA_TEXT`       | [SRC]                   |
| 3   | expo-sharing iOS builds `activityItems: [url]` — one item               | [SRC]                   |
| 4   | expo-sharing rejects non-`file://` schemes                              | [SRC]                   |
| 5   | RN `Share` drops `content.url` on Android in JS, before native          | [SRC]                   |
| 6   | RN Android `ShareModule` hardcodes `text/plain`, no `EXTRA_STREAM`      | [SRC]                   |
| 7   | RN iOS builds `activityItems: [message, URL]` — two items               | [SRC]                   |
| 8   | Therefore: iOS yes, Android no                                          | [INFERENCE] from 1–7    |
| 9   | `expo-intent-launcher` cannot set a `Parcelable` `Uri` extra            | [SRC]                   |
| 10  | `react-native-share@12.3.1` sets both extras on one intent              | [SRC]                   |
| 11  | Android the platform is not the blocker; our libraries are              | [INFERENCE] from 10     |
| 12  | `File.downloadFileAsync` is the SDK 57 download API                     | [DOC] + [SRC]           |
| 13  | Android can leave a partial file on failure; iOS cannot                 | [DOC]                   |
| 14  | `Paths.cache` is covered by expo-sharing's FileProvider paths           | [SRC]                   |
| 15  | expo-sharing adds no Android permissions                                | [SRC]                   |
| 16  | expo-file-system's three permissions are already in this app's manifest | [SRC]                   |
| 17  | No video compositing/transcoding library exists in SDK 57               | [DOC — absence]         |
| 18  | `ffmpeg-kit-react-native` is deprecated on npm                          | [COMMUNITY]             |
| 19  | Android therefore has no attribution channel at all                     | [INFERENCE] from 8 + 17 |
| 20  | The Pexels clips are faststart H.264 `mp42`, 1.5–3.3 MB, no audio       | [SRC — measured]        |

---

## 12. What could not be settled by reading

These need a device — a real one, not a simulator, since none of the target apps run in a simulator.

1. **Whether WhatsApp on Android renders `EXTRA_TEXT` as a caption when `EXTRA_STREAM` is a video.** This decides whether option 2 in [§8](#8-what-this-does-to-25) buys anything, or whether a third-party native dependency buys a caption WhatsApp discards. **Test before adopting `react-native-share`, not after.**
2. **What WhatsApp / Messages / Instagram do with iOS's two-item `activityItems`.** Both items _delivered_ is guaranteed by the API; both _displayed_ is not. Specifically: does the caption land in WhatsApp's caption box, or get dropped in favour of the file?
3. **Whether the video renders inline or as a file card**, per app, per platform. [§9](#9-inline-rendering-and-what-the-clips-themselves-look-like) shows the files are in the right shape; it cannot show what each app does with them.
4. **Whether Instagram appears in the share sheet at all** for a `video/mp4` from a third-party app, and whether anything reaches Feed or Stories without the Instagram SDK and a registered app ID.
5. **Perceived latency of the download** on a mid-range Android device on a poor connection — the gap between tapping Share and the sheet appearing. Measure before deciding a progress indicator is over-engineering.
6. **Whether an interrupted Android download leaves a truncated file** that a later share then hands to WhatsApp. The behaviour is documented ([§5](#5-the-download-path)); the consequence for our retry path is not.
7. **`react-native-share@12.3.1` against Expo SDK 57 / RN 0.86.2 / New Architecture.** Only worth time if (1) comes back positive.

Items (1) and (2) are load-bearing for #25's **decision**, not merely its implementation. They should be answered before any share code is written.
