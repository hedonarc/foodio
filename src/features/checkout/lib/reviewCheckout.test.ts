import type { CartLine, CartRestaurant } from '@/features/cart';
import type { Restaurant } from '@/features/restaurants';

import type { DeliveryAddress } from '../types/address.types';

import type { CheckoutBlocker, CheckoutInput } from './reviewCheckout';
import { reviewCheckout } from './reviewCheckout';

// Mission District, and a Monday at noon when the restaurant below is open.
const RESTAURANT_COORDS = { latitude: 37.7599, longitude: -122.4148 };
const MONDAY_NOON = new Date('2026-08-03T12:00:00');

const restaurant = (overrides: Partial<Restaurant> = {}): Restaurant =>
  ({
    id: 'rest-1',
    name: 'Taco Fiesta',
    cuisines: ['Mexican'],
    rating: 4.8,
    reviewCount: 342,
    currency: 'USD',
    deliveryFeeMinor: 199,
    deliveryEstimate: { minMinutes: 20, maxMinutes: 30 },
    ...RESTAURANT_COORDS,
    deliveryRadiusMeters: 4000,
    image: '',
    description: '',
    address: '',
    gallery: [],
    openingHours: [{ dayOfWeek: 1, opensAt: '11:00', closesAt: '22:00' }],
    reviews: [],
    ...overrides,
  }) as Restaurant;

const cartRestaurant: CartRestaurant = {
  id: 'rest-1',
  name: 'Taco Fiesta',
  currency: 'USD',
  deliveryFeeMinor: 199,
};

const line = (overrides: Partial<CartLine> = {}): CartLine => ({
  id: 'line-1',
  menuItemId: 'item-1',
  name: 'Birria Tacos',
  image: '',
  unitPriceMinor: 1499,
  quantity: 1,
  instruction: '',
  ...overrides,
});

/** 300m from the restaurant — comfortably inside a 4km radius. */
const nearbyAddress: DeliveryAddress = {
  label: 'Home',
  line1: '500 Valencia St',
  city: 'San Francisco',
  postcode: '94110',
  latitude: 37.7626,
  longitude: -122.4148,
};

const review = (overrides: Partial<CheckoutInput> = {}) =>
  reviewCheckout({
    cartRestaurant,
    lines: [line()],
    restaurant: restaurant(),
    address: nearbyAddress,
    currentPrices: [{ id: 'item-1', priceMinor: 1499 }],
    now: MONDAY_NOON,
    ...overrides,
  });

const kinds = (blockers: CheckoutBlocker[]) => blockers.map((blocker) => blocker.kind);

describe('a cart that is ready to order', () => {
  it('has no blockers', () => {
    expect(review().canPlaceOrder).toBe(true);
    expect(review().blockers).toEqual([]);
  });

  it('totals the lines and adds the delivery fee', () => {
    const result = review({ lines: [line({ quantity: 2 })] });

    expect(result.subtotalMinor).toBe(2998);
    expect(result.deliveryFeeMinor).toBe(199);
    expect(result.totalMinor).toBe(3197);
  });
});

describe('blockers', () => {
  it('blocks an empty cart, and charges no delivery fee for one', () => {
    const result = review({ lines: [] });

    expect(kinds(result.blockers)).toContain('empty-cart');
    expect(result.deliveryFeeMinor).toBe(0);
    expect(result.totalMinor).toBe(0);
  });

  it('blocks when the restaurant could not be loaded', () => {
    expect(kinds(review({ restaurant: undefined }).blockers)).toContain('restaurant-unavailable');
  });

  it('blocks when the restaurant is closed', () => {
    // Monday 23:00, after a 22:00 close.
    const result = review({ now: new Date('2026-08-03T23:00:00') });

    expect(kinds(result.blockers)).toContain('restaurant-closed');
    expect(result.canPlaceOrder).toBe(false);
  });

  it('blocks with no delivery address', () => {
    expect(kinds(review({ address: null }).blockers)).toContain('no-address');
  });

  it('does not report closed and unavailable at once', () => {
    const blockers = kinds(review({ restaurant: undefined }).blockers);
    expect(blockers).not.toContain('restaurant-closed');
  });
});

describe('delivery range', () => {
  it('allows an address inside the radius', () => {
    expect(kinds(review().blockers)).not.toContain('out-of-range');
  });

  it('blocks an address beyond it, reporting both distances', () => {
    // Berkeley — roughly 18km away, well outside a 4km radius.
    const result = review({
      address: { ...nearbyAddress, latitude: 37.8715, longitude: -122.273 },
    });

    const blocker = result.blockers.find((b) => b.kind === 'out-of-range');
    expect(blocker).toBeDefined();
    if (blocker?.kind !== 'out-of-range') throw new Error('expected out-of-range');

    expect(blocker.radiusMeters).toBe(4000);
    expect(blocker.distanceMeters).toBeGreaterThan(15_000);
  });

  it('cannot judge range without a restaurant, and says so once', () => {
    const blockers = kinds(review({ restaurant: undefined }).blockers);
    expect(blockers).not.toContain('out-of-range');
  });

  it('blocks on the server distances when the server says undeliverable', () => {
    const result = review({
      restaurant: restaurant({ isDeliverable: false, distanceMeters: 9000 }),
    });

    const blocker = result.blockers.find((b) => b.kind === 'out-of-range');
    expect(blocker).toBeDefined();
    if (blocker?.kind !== 'out-of-range') throw new Error('expected out-of-range');

    expect(blocker.distanceMeters).toBe(9000);
    expect(blocker.radiusMeters).toBe(4000);
  });

  it('trusts the server over its own math when the server says deliverable', () => {
    // Berkeley — outside the 4km radius by the client's own Haversine math,
    // so this only passes if the server's isDeliverable wins the disagreement.
    const result = review({
      address: { ...nearbyAddress, latitude: 37.8715, longitude: -122.273 },
      restaurant: restaurant({ isDeliverable: true }),
    });

    expect(kinds(result.blockers)).not.toContain('out-of-range');
  });
});

describe('price changes', () => {
  it('blocks when a line no longer matches the menu', () => {
    const result = review({ currentPrices: [{ id: 'item-1', priceMinor: 1699 }] });

    const blocker = result.blockers.find((b) => b.kind === 'price-changed');
    if (blocker?.kind !== 'price-changed') throw new Error('expected price-changed');

    expect(blocker.lines).toEqual([
      { lineId: 'line-1', name: 'Birria Tacos', wasMinor: 1499, nowMinor: 1699 },
    ]);
  });

  it('totals on the snapshot, not the new price — the customer is repriced explicitly', () => {
    const result = review({ currentPrices: [{ id: 'item-1', priceMinor: 1699 }] });
    expect(result.subtotalMinor).toBe(1499);
  });

  it('ignores an item that has left the menu rather than guessing a price', () => {
    expect(kinds(review({ currentPrices: [] }).blockers)).not.toContain('price-changed');
  });
});

describe('multiple blockers', () => {
  it('reports every reason at once so the screen can list them', () => {
    const result = review({
      lines: [],
      address: null,
      now: new Date('2026-08-03T23:00:00'),
    });

    expect(kinds(result.blockers)).toEqual(
      expect.arrayContaining(['empty-cart', 'restaurant-closed', 'no-address']),
    );
    expect(result.canPlaceOrder).toBe(false);
  });
});
