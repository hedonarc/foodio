# Onboarding Permissions Spec

## Problem Statement

New users installing the Foodio app need to be guided through granting location and notification permissions. Without these permissions, the app cannot show nearby restaurants or deliver order updates. The app currently has no onboarding flow — it is a fresh Expo 57 scaffold with no screens, routing, or navigation.

## Solution

Build a two-screen onboarding flow using Expo Router with file-based routing. Each screen prompts the user for a single permission (location, then notification) using a consistent layout: illustration at the top, descriptive text in the middle, and action buttons at the bottom. The flow completes and routes the user to a placeholder main app screen.

## User Stories

1. As a new user, I want to see a location permission screen when I first open the app, so that I understand why the app needs my location.
2. As a new user, I want to see a clear headline and description explaining the benefit of granting location access, so that I feel informed before making a decision.
3. As a new user, I want an "Allow" button that triggers the system location permission dialog, so that I can grant permission with one tap.
4. As a new user, I want a "Skip" option that lets me bypass the location permission, so that I am not forced into granting access.
5. As a new user, after interacting with the location screen (allow or skip), I want to see the notification permission screen, so that the flow progresses smoothly.
6. As a new user, I want to see a notification permission screen with a headline and description explaining why notifications matter, so that I understand the value.
7. As a new user, I want an "Allow" button that triggers the system notification permission dialog, so that I can opt in easily.
8. As a new user, I want a "Skip" option on the notification screen, so that I can proceed without enabling notifications.
9. As a new user, after completing both permission screens, I want to land on the main app screen, so that I can start using the app immediately.
10. As a user who denies a permission, I want to continue through the onboarding flow without being blocked or nagged, so that the experience feels respectful.
11. As a user, I want smooth transition animations between onboarding screens, so that the flow feels polished and native.
12. As a user, I want the onboarding to track that I completed it, so that I am not shown the permission screens again on subsequent app launches.
13. As a user, I want a visually consistent layout across both permission screens, so that the experience feels cohesive.
14. As a user, I want the "Allow" button to be visually prominent (solid primary) and the "Skip" button to be subtle (text link), so that I can easily distinguish the recommended action.
15. As a user, I want each screen to have an illustration or icon that visually represents the permission being requested, so that I can quickly understand the context.

## Implementation Decisions

### Routing

- Use Expo Router with file-based routing.
- Migrate from legacy `App.tsx` entry point to `expo-router/entry`.
- Onboarding screens live under `app/(onboarding)/` group.
- Placeholder main screen lives at `app/(tabs)/` or `app/index.tsx` after onboarding.

### Feature Structure

- Create `src/features/onboarding/` with full feature-first structure:
  - `screens/` — `LocationPermissionScreen.tsx`, `NotificationPermissionScreen.tsx`
  - `components/` — `PermissionScreen.tsx` (shared layout component)
  - `hooks/` — `usePermissionRequest.ts` (wraps expo-location / expo-notifications permission logic)
  - `types/` — `onboarding.types.ts`
  - `index.ts` — public API barrel export

### Shared PermissionScreen Component

- A reusable `PermissionScreen` component that accepts:
  - `illustration` — image source (require() or URI)
  - `title` — headline text (e.g. "Enable Location")
  - `description` — supporting text
  - `onAllow` — callback when "Allow" is tapped
  - `onSkip` — callback when "Skip" is tapped
- Layout: illustration top, text middle, buttons bottom. No progress indicator.

### Permission Handling

- Tapping "Allow" triggers the native system permission dialog via `expo-location` or `expo-notifications`.
- Tapping "Skip" navigates to the next screen without requesting the system permission.
- If the user denies the system permission, the app navigates to the next screen gracefully. No retry, no settings redirect, no blocking.
- The actual OS permission result (granted/denied) is NOT persisted — only the completion status of each onboarding step is tracked.

### State Management

- Zustand store at `src/stores/onboarding.store.ts` tracks:
  - `hasCompletedOnboarding: boolean`
  - `locationStepCompleted: boolean`
  - `notificationStepCompleted: boolean`
- State is in-memory only (resets on app restart — onboarding shown each fresh install).

### Styling

- NativeWind for all styling.
- Tailwind utility classes for layout, typography, spacing, colors.
- "Allow" button: solid primary background, white text, rounded, full-width.
- "Skip" button: text-only link, muted color, centered below Allow.

### Transitions

- Use Expo Router's built-in transition animations for navigation between onboarding screens.

### Assets

- User will provide illustration PNGs/SVGs for location and notification screens.
- Placeholders will be used initially, with asset paths wired to accept the real files later.

## Testing Decisions

- Test the `PermissionScreen` component renders with correct title, description, and buttons.
- Test the `usePermissionRequest` hook calls the correct expo SDK method on allow.
- Test the Zustand onboarding store state transitions (step completion, overall completion).
- Test navigation flow: completing both screens routes to placeholder.
- Avoid snapshot testing — prefer behavior-based assertions.

## Out of Scope

- Actual API calls to save permission status to a backend.
- Deep linking to system settings for denied permissions.
- Analytics/tracking of permission grant rates.
- Custom illustration design (user provides assets).
- Post-onboarding main app screens (placeholder only).
- E2E testing of native permission dialogs.

## Further Notes

- The project is a fresh Expo 57 scaffold. Expo Router, NativeWind, Zustand, expo-location, and expo-notifications all need to be installed and configured from scratch.
- The `app/` directory structure should follow the architecture documented in `docs/ARCHITECTURE.md`.
- Path aliases (`@/*` → `src/*`) are already configured in `tsconfig.json`.
