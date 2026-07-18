# Food Platform Mobile

A production-grade React Native application built with Expo and TypeScript.

## Tech Stack

- Expo (Continuous Native Generation)
- React Native
- TypeScript
- Expo Router
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Axios
- Expo Image

---

## Requirements

- Node.js >= 22 LTS
- pnpm
- Xcode (iOS)
- Android Studio
- Expo CLI

---

## Getting Started

Install dependencies

```bash
pnpm install
```

Start development server

```bash
pnpm start
```

Run Android

```bash
pnpm android
```

Run iOS

```bash
pnpm ios
```

---

## Project Principles

- Feature-first architecture
- Type-safe APIs
- Minimal global state
- Server state managed by TanStack Query
- Client state managed by Zustand
- Clean Architecture
- SOLID principles
- Reusable UI components

---

## Folder Structure

```
app/
src/
    features/
    components/
    hooks/
    services/
    api/
    stores/
    lib/
    constants/
    theme/
    types/
    utils/
assets/
```

---

## State Management

### Server State

TanStack Query

### Client State

Zustand

---

## Validation

Zod

---

## Forms

React Hook Form

---

## Networking

Axios

---

## Styling

NativeWind

---

## Linting

ESLint

Prettier

Husky

Lint Staged

---

## Commits

Conventional Commits

Example

feat(feed): add autoplay support

fix(auth): refresh token bug

refactor(search): simplify filters

---

## Branch Strategy

main

develop

feature/*

bugfix/*

hotfix/*

---

## Pull Requests

Every PR should

- pass lint
- pass typecheck
- pass tests
- include screenshots when UI changes
- be reviewed before merge

---

## Performance Goals

- 60 FPS scrolling
- Fast startup
- Minimal re-renders
- Lazy loading
- Memoization only when necessary

---

## Philosophy

Prefer simple solutions.

Avoid premature abstractions.

Optimize for readability and maintainability.
