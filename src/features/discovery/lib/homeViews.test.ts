import type { RestaurantSummary } from '@/features/restaurants';

import { applyView, HOME_VIEWS } from './homeViews';

const place = (overrides: Partial<RestaurantSummary>): RestaurantSummary =>
  ({
    id: overrides.name ?? 'x',
    cuisines: [],
    rating: 0,
    reviewCount: 0,
    deliveryFeeMinor: 9000,
    deliveryEstimate: { minMinutes: 25, maxMinutes: 35 },
    ...overrides,
  }) as RestaurantSummary;

const names = (list: RestaurantSummary[]) => list.map((restaurant) => restaurant.name);

const bakery = place({
  name: 'Sweet Tooth',
  rating: 4,
  reviewCount: 1,
  deliveryFeeMinor: 0,
  deliveryEstimate: { minMinutes: 15, maxMinutes: 25 },
  distanceMeters: 900,
});
const tacos = place({
  name: 'Taco Fiesta',
  deliveryEstimate: { minMinutes: 20, maxMinutes: 30 },
  distanceMeters: 300,
});
const slow = place({
  name: 'Slow Grill',
  deliveryEstimate: { minMinutes: 30, maxMinutes: 45 },
  distanceMeters: 600,
});

describe('the Home views', () => {
  it('are four, and All is the first', () => {
    expect(HOME_VIEWS).toEqual(['all', 'fast', 'free', 'rated']);
  });

  it('All keeps everything, nearest first', () => {
    expect(names(applyView([bakery, tacos, slow], 'all'))).toEqual([
      'Taco Fiesta',
      'Slow Grill',
      'Sweet Tooth',
    ]);
  });

  it('Fast delivery keeps what arrives inside half an hour, fastest first', () => {
    expect(names(applyView([bakery, tacos, slow], 'fast'))).toEqual(['Sweet Tooth', 'Taco Fiesta']);
  });

  it('Free delivery keeps only the places that charge nothing', () => {
    expect(names(applyView([bakery, tacos, slow], 'free'))).toEqual(['Sweet Tooth']);
  });

  it('Top rated sorts rather than filters, so a pilot of New places is not an empty tab', () => {
    expect(names(applyView([tacos, bakery, slow], 'rated'))[0]).toBe('Sweet Tooth');
    expect(applyView([tacos, bakery, slow], 'rated')).toHaveLength(3);
  });
});
