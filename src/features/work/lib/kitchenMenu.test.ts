import type { MenuItem, RestaurantMenu } from '@/features/menu/types/menu.types';

import { soldOutLast } from './kitchenMenu';

const item = (id: string, isAvailable?: boolean): MenuItem => ({
  id,
  restaurantId: 'rest-1',
  menuCategoryId: 'cat-1',
  name: id,
  description: '',
  priceMinor: 500,
  image: 'https://example.com/dish.jpg',
  ...(isAvailable === undefined ? {} : { isAvailable }),
});

const menuWith = (items: MenuItem[]): RestaurantMenu => [
  { id: 'cat-1', restaurantId: 'rest-1', name: 'Mains', position: 0, menuItems: items },
];

describe('soldOutLast', () => {
  it('sinks sold-out items to the bottom of their category', () => {
    const menu = menuWith([item('a', false), item('b', true), item('c')]);

    const ids = soldOutLast(menu)[0]?.menuItems.map((entry) => entry.id);

    expect(ids).toEqual(['b', 'c', 'a']);
  });

  it('keeps canonical order within each half — the sort is stable', () => {
    const menu = menuWith([
      item('a', false),
      item('b'),
      item('c', false),
      item('d', true),
      item('e', false),
    ]);

    const ids = soldOutLast(menu)[0]?.menuItems.map((entry) => entry.id);

    expect(ids).toEqual(['b', 'd', 'a', 'c', 'e']);
  });

  it('treats an absent flag as available — only false means sold out', () => {
    const menu = menuWith([item('a'), item('b')]);

    expect(soldOutLast(menu)[0]?.menuItems.map((entry) => entry.id)).toEqual(['a', 'b']);
  });

  it('sorts each category independently and never reorders categories', () => {
    const menu: RestaurantMenu = [
      {
        id: 'cat-1',
        restaurantId: 'rest-1',
        name: 'Starters',
        position: 0,
        menuItems: [item('a', false), item('b')],
      },
      {
        id: 'cat-2',
        restaurantId: 'rest-1',
        name: 'Mains',
        position: 1,
        menuItems: [item('c'), item('d', false)],
      },
    ];

    const sorted = soldOutLast(menu);

    expect(sorted.map((category) => category.id)).toEqual(['cat-1', 'cat-2']);
    expect(sorted[0]?.menuItems.map((entry) => entry.id)).toEqual(['b', 'a']);
    expect(sorted[1]?.menuItems.map((entry) => entry.id)).toEqual(['c', 'd']);
  });

  it('does not mutate the shared cache value it reads', () => {
    const menu = menuWith([item('a', false), item('b')]);

    soldOutLast(menu);

    expect(menu[0]?.menuItems.map((entry) => entry.id)).toEqual(['a', 'b']);
  });
});
