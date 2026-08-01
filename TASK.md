# Task: Build Restaurant Menu (MVP)

## Objective

Extend the existing **Restaurant Details** experience by adding a browsable restaurant menu.

The goal is for users to:

1. Open a restaurant from the Home Discovery screen.
2. View restaurant information.
3. Browse menu categories.
4. Browse menu items.

This task is **UI and architecture only**.

Use **mock data only**.

Do **not** implement ordering, cart logic, networking, or backend integration.

---

# Existing Context

Already implemented:

- Home Discovery
- Featured Video Carousel
- Restaurant Carousel
- Restaurant Details

The Restaurant Details screen currently ends after the restaurant information.

This task extends that screen by introducing the restaurant's menu.

---

# Feature

Create a new feature:

```text
src/features/menu/
```

Suggested structure:

```text
menu/
├── components/
│   ├── MenuCategory.tsx
│   ├── MenuCategorySection.tsx
│   ├── MenuItemCard.tsx
│   ├── MenuPrice.tsx
│   └── MenuSectionHeader.tsx
│
├── data/
│   └── menu.mock.ts
│
├── types/
│   └── menu.types.ts
│
└── index.ts
```

Do **not** create:

- API
- hooks
- services
- Zustand stores
- React Query hooks

unless absolutely necessary.

---

# Menu Data

Create mock menu data.

Each restaurant should reference menu categories.

Example:

```text
Restaurant

↓

Categories

↓

Menu Items
```

Example categories:

- Popular
- Burgers
- Pizza
- Pasta
- Drinks
- Desserts

Each menu item should include:

- id
- restaurantId
- categoryId
- name
- description
- price
- image
- rating (optional)
- isPopular (optional)

Use realistic food names.

---

# Restaurant Details Integration

Update the existing Restaurant Details screen.

Current flow:

```text
Header

↓

Hero

↓

Info

↓

Gallery

↓

Hours

↓

Reviews
```

New flow:

```text
Header

↓

Hero

↓

Info

↓

Menu

↓

Gallery

↓

Hours

↓

Reviews
```

The Menu section should appear naturally as part of the restaurant page.

---

# Menu Categories

Display categories vertically.

Example:

```text
Popular

🍔 Double Smash Burger

🍟 Loaded Fries

🥤 Cola

──────────────

Burgers

🍔 Classic Burger

🍔 Cheese Burger

──────────────

Drinks

🥤 Cola

🥤 Sprite

──────────────

Desserts

🍰 Cheesecake

🍦 Ice Cream
```

No sticky headers.

No tabs.

No horizontal category selector.

Keep it simple.

---

# Menu Item Card

Each item should display:

- Food image
- Name
- Description
- Price

Optional:

- Popular badge
- Rating

Do **not** implement:

- Quantity selector
- Add to cart
- Favorite
- Share
- Reviews

This is a browse-only experience.

---

# Images

Use `expo-image`.

Reuse local mock assets or placeholder images.

---

# Styling

Use:

- NativeWind
- Existing theme tokens
- Existing UI components where appropriate

Avoid hardcoded colors.

---

# Navigation

Do **not** create a Menu Details screen.

Do **not** navigate when tapping a menu item.

That will be implemented in a future task.

---

# Out of Scope

Do NOT implement:

- Cart
- Checkout
- Orders
- Authentication
- API
- Axios
- TanStack Query
- Search
- Filtering
- Category chips
- Sticky category navigation
- Quantity selectors
- Add-to-cart buttons
- Bottom sheets
- Animations
- Skeleton loaders
- Pagination
- Reviews for menu items

---

# Acceptance Criteria

- New `menu` feature created.
- Restaurant Details displays a complete menu.
- Categories render correctly.
- Menu items render correctly.
- Mock data only.
- Components are reusable and focused.
- Uses absolute imports.
- No TypeScript errors.
- No ESLint errors.
- No unnecessary abstractions.
- No new dependencies.

---

# Engineering Notes

Follow the existing project conventions:

- Feature-first architecture.
- TypeScript strict.
- Prefer `type` over `interface`.
- Keep components stateless where possible.
- Keep business logic minimal.
- Introduce abstractions only when a real need exists.

Do not refactor unrelated code as part of this task.

---

# Success Definition

At the end of this task, a user should be able to:

1. Complete onboarding.
2. Discover restaurants.
3. Open a restaurant.
4. Browse the restaurant's complete menu.

The restaurant should now feel like a real destination rather than a static profile page, while keeping the implementation intentionally simple and ready for future additions such as menu item details, cart, and checkout.
