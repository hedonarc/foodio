import type { RestaurantSummary } from '@/features/restaurants';

import { categoriesFrom } from './categories';

const serving = (id: string, cuisines: string[]): RestaurantSummary =>
  ({ id, name: id, cuisines }) as RestaurantSummary;

describe('the cuisine rail', () => {
  it('lists each cuisine once, the most cooked first', () => {
    const categories = categoriesFrom([
      serving('a', ['Pizza', 'Pasta']),
      serving('b', ['Pizza', 'Burgers']),
      serving('c', ['Pizza']),
    ]);

    expect(categories.map((category) => category.name)).toEqual(['Pizza', 'Burgers', 'Pasta']);
    expect(categories[0]?.count).toBe(3);
  });

  it('breaks a tie alphabetically, so the order is stable between loads', () => {
    const categories = categoriesFrom([serving('a', ['Thai', 'Burgers', 'American'])]);

    expect(categories.map((category) => category.name)).toEqual(['American', 'Burgers', 'Thai']);
  });

  it('gives a cuisine it has never heard of a plate, not a blank', () => {
    const [category] = categoriesFrom([serving('a', ['Balti'])]);

    expect(category?.emoji).toBe('🍽️');
  });

  it('has nothing to say about no restaurants', () => {
    expect(categoriesFrom([])).toEqual([]);
  });
});
