import { create } from 'zustand';

import type { AddableMenuItem, CartLine, CartRestaurant } from '@/features/cart';

type CartState = {
  /** Null when the Cart is empty. A Cart is always bound to one restaurant. */
  restaurant: CartRestaurant | null;
  lines: CartLine[];
  /** Monotonic, so line ids are unique without randomness. */
  nextLineId: number;

  addItem: (restaurant: CartRestaurant, item: AddableMenuItem) => void;
  incrementLine: (lineId: string) => void;
  decrementLine: (lineId: string) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
};

type CartContents = Pick<CartState, 'restaurant' | 'lines' | 'nextLineId'>;

/** A fresh empty cart. A function so no two callers share one `lines` array. */
const emptyCart = (): CartContents => ({ restaurant: null, lines: [], nextLineId: 1 });

export const useCartStore = create<CartState>((set) => ({
  ...emptyCart(),

  /**
   * Adding from a different restaurant replaces the Cart rather than merging.
   * Two restaurants means two sets of delivery staff, which is two orders —
   * so this is enforced here rather than left to callers to remember.
   * Use `selectIsFromOtherRestaurant` to warn the customer first.
   */
  addItem: (restaurant, item) =>
    set((state) => {
      const isSameRestaurant = state.restaurant?.id === restaurant.id;
      const lines = isSameRestaurant ? state.lines : [];

      const existing = lines.find((line) => line.menuItemId === item.id);
      if (existing) {
        return {
          restaurant,
          lines: lines.map((line) =>
            line.id === existing.id ? { ...line, quantity: line.quantity + 1 } : line,
          ),
        };
      }

      const line: CartLine = {
        id: `line-${state.nextLineId}`,
        menuItemId: item.id,
        name: item.name,
        image: item.image,
        unitPriceMinor: item.priceMinor,
        quantity: 1,
      };

      return { restaurant, lines: [...lines, line], nextLineId: state.nextLineId + 1 };
    }),

  incrementLine: (lineId) =>
    set((state) => ({
      lines: state.lines.map((line) =>
        line.id === lineId ? { ...line, quantity: line.quantity + 1 } : line,
      ),
    })),

  /** Decrementing the last unit removes the line — a zero-quantity line is not a thing. */
  decrementLine: (lineId) =>
    set((state) => {
      const lines = state.lines
        .map((line) => (line.id === lineId ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0);

      return lines.length === 0 ? emptyCart() : { lines };
    }),

  removeLine: (lineId) =>
    set((state) => {
      const lines = state.lines.filter((line) => line.id !== lineId);
      return lines.length === 0 ? emptyCart() : { lines };
    }),

  clear: () => set(emptyCart()),
}));

// ─── selectors ───────────────────────────────────────────────────────────────

/** Total units, not lines — "3" for one burger and two colas. */
export const selectItemCount = (state: CartState): number =>
  state.lines.reduce((count, line) => count + line.quantity, 0);

export const selectSubtotalMinor = (state: CartState): number =>
  state.lines.reduce((total, line) => total + line.unitPriceMinor * line.quantity, 0);

/** An empty Cart owes nothing, delivery fee included. */
export const selectTotalMinor = (state: CartState): number => {
  if (state.lines.length === 0) return 0;
  return selectSubtotalMinor(state) + (state.restaurant?.deliveryFeeMinor ?? 0);
};

export const selectIsEmpty = (state: CartState): boolean => state.lines.length === 0;

/** True when adding from `restaurantId` would discard what is already in the Cart. */
export const selectIsFromOtherRestaurant =
  (restaurantId: string) =>
  (state: CartState): boolean =>
    state.lines.length > 0 && state.restaurant !== null && state.restaurant.id !== restaurantId;

/** Units of one menu item currently in the Cart, for the menu's stepper. */
export const selectQuantityOf =
  (menuItemId: string) =>
  (state: CartState): number =>
    state.lines.find((line) => line.menuItemId === menuItemId)?.quantity ?? 0;

export const selectLineOf =
  (menuItemId: string) =>
  (state: CartState): CartLine | undefined =>
    state.lines.find((line) => line.menuItemId === menuItemId);
