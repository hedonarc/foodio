# Mobile Architecture

## Overview

This project follows a **Feature-First Clean Architecture**.

The primary goals are:

- Scalability
- Maintainability
- High developer productivity
- Clear ownership
- Testability
- Strong type safety
- Minimal coupling

The application is organized by **features**, not by technical layers.

---

# High Level Structure

```
.
├── app/
├── assets/
├── docs/
├── scripts/
├── src/
├── tests/
└── ...
```

---

# app/

The `app` directory is owned by **Expo Router**.

It should contain routing only.

Examples:

```
app/

    _layout.tsx

    +not-found.tsx

    (auth)/

    (tabs)/

    restaurant/

    order/
```

Avoid putting:

- business logic
- API calls
- Zustand stores
- reusable components

inside `app`.

Think of this folder as the application's URL map.

---

# assets/

Contains static assets.

```
assets/

    fonts/

    icons/

    images/

    animations/
```

No business logic.

---

# src/

All application code lives here.

```
src/

    api/

    components/

    config/

    constants/

    features/

    hooks/

    lib/

    providers/

    services/

    stores/

    theme/

    types/

    utils/
```

---

# api/

Responsible for HTTP communication.

```
api/

    client.ts

    interceptors.ts

    endpoints.ts

    auth.api.ts

    restaurant.api.ts

    order.api.ts
```

Responsibilities:

- Axios instance
- Interceptors
- Authentication headers
- Retry policies
- Error normalization

Never import Axios directly outside this folder.

---

# components/

Reusable UI.

```
components/

    ui/

    shared/
```

## ui/

Pure design system.

Examples:

```
Button

TextField

Badge

Avatar

Card

Modal
```

Should never contain business logic.

---

## shared/

Reusable application components.

Examples:

```
RestaurantCard

VideoPlayer

RatingStars

OrderStatus

EmptyState
```

These may contain some application knowledge but should remain reusable.

---

# config/

Application configuration.

```
config/

    env.ts

    query.ts

    axios.ts
```

No feature-specific configuration.

---

# constants/

Static constants.

```
constants/

    routes.ts

    regex.ts

    storage.ts

    queryKeys.ts
```

---

# features/

The heart of the application.

Each feature owns everything related to itself.

Example:

```
features/

    auth/

    feed/

    restaurants/

    orders/

    profile/

    search/
```

---

## Feature Structure

Example:

```
restaurants/

    api/

    components/

    hooks/

    screens/

    types/

    validation/

    index.ts
```

A feature should be self-contained.

If another feature needs something, expose it via `index.ts`.

---

# hooks/

Global reusable hooks.

Examples:

```
useDebounce

useKeyboard

usePrevious

usePermission
```

Feature-specific hooks belong inside the feature.

---

# lib/

Third-party wrappers.

Examples:

```
analytics/

sentry/

firebase/

stripe/
```

This prevents vendor lock-in.

The rest of the application imports our wrapper instead of the SDK directly.

---

# providers/

React Providers.

Examples:

```
AppProvider

ThemeProvider

QueryProvider

AuthProvider
```

Root providers only.

---

# services/

Cross-feature services.

Examples:

```
push/

deeplink/

permissions/

notifications/
```

Do not place feature logic here.

---

# stores/

Global Zustand stores.

Examples:

```
auth.store.ts

theme.store.ts

app.store.ts
```

Do not create one giant store.

Split by responsibility.

---

# theme/

Application design tokens.

```
theme/

    colors.ts

    typography.ts

    spacing.ts

    shadows.ts

    radius.ts
```

Never hardcode colors inside components.

---

# types/

Global shared types.

Examples:

```
api.types.ts

navigation.types.ts
```

Feature types belong inside the feature.

---

# utils/

Pure helper functions.

Examples:

```
date.ts

currency.ts

number.ts

strings.ts
```

Utilities should:

- be deterministic
- have no side effects
- never depend on React

---

# tests/

Integration and shared test utilities.

Feature unit tests should live beside the code they test.

---

# Ownership Rules

Every feature owns:

- API
- Components
- Hooks
- Validation
- Types
- Screens
- Tests

Avoid sharing until duplication becomes a maintenance problem.

---

# Dependency Direction

```
UI

↓

Hooks

↓

Feature API

↓

Shared API Client

↓

Server
```

Never reverse this flow.

---

# State Management

## Server State

TanStack Query.

Examples:

- restaurants
- feed
- orders
- reviews

Never copy server state into Zustand.

---

## Client State

Zustand.

Examples:

- authentication
- theme
- onboarding
- app preferences
- UI state

---

# Styling

- NativeWind for most styling
- Design tokens in `theme`
- Dynamic values via `StyleSheet` or inline styles when necessary

---

# Naming Conventions

Components

```
RestaurantCard.tsx
```

Hooks

```
useRestaurants.ts
```

Store

```
auth.store.ts
```

API

```
restaurant.api.ts
```

Validation

```
restaurant.schema.ts
```

Types

```
restaurant.types.ts
```

Constants

```
queryKeys.ts
```

---

# Import Rules

Good

```ts
import { Button } from '@/components/ui';
import { useRestaurants } from '@/features/restaurants';
```

Bad

```ts
import Button from '../../../../components/Button';
```

Always use absolute imports.

---

# Design Principles

- Feature-first
- Composition over inheritance
- Small focused files
- Single responsibility
- Strong typing
- No circular dependencies
- Keep abstractions minimal

---

# What Doesn't Belong Here

Avoid creating:

- Generic repositories for every endpoint
- Abstract service layers with no clear value
- Deep inheritance hierarchies
- One global `utils.ts`
- One massive Zustand store
- Global hooks for feature-specific behavior

Optimize for clarity first.

Only introduce additional abstraction when multiple features genuinely need it.

---

# Future Growth

This architecture is designed to scale from:

- 2 engineers
- MVP

to

- Multiple mobile teams
- Hundreds of screens
- Millions of users

without requiring a major folder restructuring.
