import type { AddableMenuItem, CartRestaurant } from '@/features/cart';

import {
  selectIsEmpty,
  selectIsFromOtherRestaurant,
  selectItemCount,
  selectQuantityOf,
  selectSubtotalMinor,
  selectTotalMinor,
  useCartStore,
} from './cart.store';

const tacos: CartRestaurant = {
  id: 'rest-1',
  name: 'Taco Fiesta',
  currency: 'USD',
  deliveryFeeMinor: 199,
};

const pizza: CartRestaurant = {
  id: 'rest-2',
  name: 'Bella Italia',
  currency: 'USD',
  deliveryFeeMinor: 0,
};

const item = (id: string, priceMinor: number): AddableMenuItem => ({
  id,
  name: id,
  image: `https://example.test/${id}.jpg`,
  priceMinor,
});

const birria = item('r1-pop-1', 1499);
const horchata = item('r1-pop-3', 425);
const margherita = item('r2-pop-2', 1850);

const state = () => useCartStore.getState();

beforeEach(() => {
  useCartStore.getState().clear();
});

describe('addItem', () => {
  it('starts an empty cart with one line', () => {
    state().addItem(tacos, birria);

    expect(state().lines).toHaveLength(1);
    expect(state().lines[0]?.quantity).toBe(1);
    expect(state().restaurant?.id).toBe('rest-1');
  });

  it('snapshots the price rather than referencing the menu item', () => {
    state().addItem(tacos, birria);
    expect(state().lines[0]?.unitPriceMinor).toBe(1499);
  });

  it('increments the existing line when the same item is added again', () => {
    state().addItem(tacos, birria);
    state().addItem(tacos, birria);

    expect(state().lines).toHaveLength(1);
    expect(state().lines[0]?.quantity).toBe(2);
  });

  it('adds a separate line for a different item', () => {
    state().addItem(tacos, birria);
    state().addItem(tacos, horchata);

    expect(state().lines).toHaveLength(2);
    expect(state().lines.map((line) => line.id)).toEqual(['line-1', 'line-2']);
  });

  it('gives each line its own id rather than reusing the menu item id', () => {
    state().addItem(tacos, birria);

    const [line] = state().lines;
    expect(line?.id).not.toBe(line?.menuItemId);
  });

  describe('the one-restaurant invariant', () => {
    it('replaces the cart when adding from a different restaurant', () => {
      state().addItem(tacos, birria);
      state().addItem(tacos, horchata);
      state().addItem(pizza, margherita);

      expect(state().restaurant?.id).toBe('rest-2');
      expect(state().lines).toHaveLength(1);
      expect(state().lines[0]?.menuItemId).toBe('r2-pop-2');
    });

    it('never merges lines across restaurants', () => {
      state().addItem(tacos, birria);
      state().addItem(pizza, margherita);

      expect(state().lines.every((line) => line.menuItemId.startsWith('r2-'))).toBe(true);
    });
  });
});

describe('quantity changes', () => {
  it('increments a line', () => {
    state().addItem(tacos, birria);
    const lineId = state().lines[0]?.id ?? '';
    state().incrementLine(lineId);

    expect(state().lines[0]?.quantity).toBe(2);
  });

  it('decrements a line', () => {
    state().addItem(tacos, birria);
    state().addItem(tacos, birria);
    state().decrementLine(state().lines[0]?.id ?? '');

    expect(state().lines[0]?.quantity).toBe(1);
  });

  it('removes the line when the last unit is decremented', () => {
    state().addItem(tacos, birria);
    state().addItem(tacos, horchata);
    state().decrementLine(state().lines[0]?.id ?? '');

    expect(state().lines).toHaveLength(1);
    expect(state().lines[0]?.menuItemId).toBe('r1-pop-3');
  });

  it('unbinds the restaurant once the last line goes', () => {
    state().addItem(tacos, birria);
    state().decrementLine(state().lines[0]?.id ?? '');

    expect(state().restaurant).toBeNull();
    expect(selectIsEmpty(state())).toBe(true);
  });

  it('unbinds the restaurant when the last line is removed outright', () => {
    state().addItem(tacos, birria);
    state().removeLine(state().lines[0]?.id ?? '');

    expect(state().restaurant).toBeNull();
  });

  it('ignores an unknown line id', () => {
    state().addItem(tacos, birria);
    state().incrementLine('line-does-not-exist');

    expect(state().lines[0]?.quantity).toBe(1);
  });
});

describe('totals', () => {
  it('counts units, not lines', () => {
    state().addItem(tacos, birria);
    state().addItem(tacos, birria);
    state().addItem(tacos, horchata);

    expect(state().lines).toHaveLength(2);
    expect(selectItemCount(state())).toBe(3);
  });

  it('sums line totals exactly', () => {
    state().addItem(tacos, birria); // 1499
    state().addItem(tacos, birria); // 2998
    state().addItem(tacos, horchata); // + 425

    expect(selectSubtotalMinor(state())).toBe(3423);
  });

  it('adds the delivery fee to the total', () => {
    state().addItem(tacos, horchata);
    expect(selectTotalMinor(state())).toBe(425 + 199);
  });

  it('charges nothing on an empty cart, delivery fee included', () => {
    expect(selectTotalMinor(state())).toBe(0);
  });

  it('handles a free delivery fee', () => {
    state().addItem(pizza, margherita);
    expect(selectTotalMinor(state())).toBe(1850);
  });

  it('stays exact where floats would drift', () => {
    // 10c + 20c. As floats, 0.1 + 0.2 is 0.30000000000000004.
    state().addItem(tacos, item('dime', 10));
    state().addItem(tacos, item('score', 20));

    expect(selectSubtotalMinor(state())).toBe(30);
  });
});

describe('selectIsFromOtherRestaurant', () => {
  it('is false for an empty cart, so the first add is never challenged', () => {
    expect(selectIsFromOtherRestaurant('rest-2')(state())).toBe(false);
  });

  it('is false for the restaurant the cart is already bound to', () => {
    state().addItem(tacos, birria);
    expect(selectIsFromOtherRestaurant('rest-1')(state())).toBe(false);
  });

  it('is true when the cart holds another restaurant’s items', () => {
    state().addItem(tacos, birria);
    expect(selectIsFromOtherRestaurant('rest-2')(state())).toBe(true);
  });
});

describe('selectQuantityOf', () => {
  it('is zero for an item not in the cart', () => {
    expect(selectQuantityOf('r1-pop-1')(state())).toBe(0);
  });

  it('reports the units held for an item', () => {
    state().addItem(tacos, birria);
    state().addItem(tacos, birria);

    expect(selectQuantityOf('r1-pop-1')(state())).toBe(2);
  });
});
