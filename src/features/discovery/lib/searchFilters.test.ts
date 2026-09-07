import type { RestaurantSummary } from '@/features/restaurants';

import { applyFilters, EMPTY_FILTERS, toggleIn } from './searchFilters';

const place = (overrides: Partial<RestaurantSummary>): RestaurantSummary =>
  ({
    id: overrides.name ?? 'x',
    cuisines: [],
    rating: 4.5,
    reviewCount: 10,
    deliveryFeeMinor: 0,
    deliveryEstimate: { minMinutes: 15, maxMinutes: 25 },
    ...overrides,
  }) as RestaurantSummary;

const names = (list: RestaurantSummary[]) => list.map((restaurant) => restaurant.name);

const sushi = place({
  name: 'Sakura',
  cuisines: ['Sushi'],
  deliveryFeeMinor: 15000,
  distanceMeters: 900,
});
const bakery = place({
  name: 'Sweet Tooth',
  cuisines: ['Cakes'],
  rating: 4.0,
  distanceMeters: 300,
});
const slow = place({
  name: 'Slow Grill',
  cuisines: ['BBQ'],
  rating: 3.2,
  deliveryEstimate: { minMinutes: 30, maxMinutes: 45 },
  isDeliverable: false,
});

describe('narrowing search results', () => {
  it('with no filters keeps everything, nearest first', () => {
    expect(names(applyFilters([sushi, bakery, slow], EMPTY_FILTERS))).toEqual([
      'Sweet Tooth',
      'Sakura',
      'Slow Grill',
    ]);
  });

  it('a cuisine chip keeps only places that cook it', () => {
    const result = applyFilters([sushi, bakery, slow], { ...EMPTY_FILTERS, cuisines: ['Sushi'] });

    expect(names(result)).toEqual(['Sakura']);
  });

  it('every toggle must pass, not any', () => {
    const result = applyFilters([sushi, bakery, slow], {
      ...EMPTY_FILTERS,
      toggles: ['freeDelivery', 'topRated'],
    });

    expect(names(result)).toEqual(['Sweet Tooth']);
  });

  it('treats an unknown distance as deliverable, and a known no as no', () => {
    const result = applyFilters([sushi, slow], { ...EMPTY_FILTERS, toggles: ['deliversHere'] });

    expect(names(result)).toEqual(['Sakura']);
  });

  it('sorts by what was asked for', () => {
    const all = [sushi, bakery, slow];

    expect(names(applyFilters(all, { ...EMPTY_FILTERS, sort: 'rating' }))[0]).toBe('Sakura');
    expect(names(applyFilters(all, { ...EMPTY_FILTERS, sort: 'cheapest' }))[2]).toBe('Sakura');
    expect(names(applyFilters(all, { ...EMPTY_FILTERS, sort: 'fastest' }))[2]).toBe('Slow Grill');
  });

  it('never reorders the array it was handed', () => {
    const all = [sushi, bakery];
    applyFilters(all, EMPTY_FILTERS);

    expect(names(all)).toEqual(['Sakura', 'Sweet Tooth']);
  });
});

describe('toggleIn', () => {
  it('adds what is absent and removes what is present', () => {
    expect(toggleIn(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleIn(['a', 'b'], 'a')).toEqual(['b']);
  });
});
