# AGENT.md

This repository follows strict engineering standards.

## General Rules

- Always use TypeScript.
- Never use JavaScript.
- Never use `any`.
- Prefer `type` over `interface` unless extension is required.
- Enable strict typing.
- Avoid unnecessary abstractions.
- Keep files small and focused.
- Prefer composition over inheritance.

---

# Architecture

Feature-first architecture.

Do not organize code by file type.

Every feature owns:

- screens
- components
- hooks
- services
- api
- types
- validation
- tests

---

# State Management

Use TanStack Query for:

- API data
- pagination
- caching
- mutations

Use Zustand for:

- authentication
- UI state
- theme
- onboarding

Never duplicate server state inside Zustand.

---

# API

Use Axios.

Never call fetch directly.

Always use the shared API client.

All requests should go through

src/api

---

# Forms

Use

React Hook Form

+

Zod

Never use uncontrolled validation.

---

# Styling

Use NativeWind.

Avoid inline styles except for dynamic values.

Shared colors belong in theme.

---

# Components

Prefer

Small

Reusable

Stateless

Memoize only after profiling.

---

# Imports

Always use absolute imports.

Never use deeply nested relative imports.

Good

@/features/feed

Bad

../../../feed

---

# Naming

PascalCase

Components

camelCase

functions

kebab-case

folders

UPPER_CASE

constants

---

# Error Handling

Never swallow errors.

Surface meaningful messages.

Log unexpected failures.

---

# Logging

No console.log in production.

---

# Performance

Avoid unnecessary renders.

Use FlashList for long lists.

Use expo-image for images.

Lazy load heavy screens.

---

# Testing

Write tests for

- business logic
- hooks
- utilities

Avoid snapshot-heavy testing.

---

# Code Style

Early returns.

Small functions.

Descriptive names.

Readable code over clever code.

---

# Security

Never store tokens in AsyncStorage.

Use Expo Secure Store.

Never expose secrets.

Never hardcode API keys.

---

# Pull Requests

Keep PRs under 500 lines when possible.

One feature per PR.

---

# Goal

Write code that is easy to understand six months later.

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.
