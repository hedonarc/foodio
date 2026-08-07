export const queryKeys = {
  restaurants: {
    all: ['restaurants'] as const,
    list: (query?: string) => [...queryKeys.restaurants.all, 'list', query ?? ''] as const,
    detail: (restaurantId: string) =>
      [...queryKeys.restaurants.all, 'detail', restaurantId] as const,
    menu: (restaurantId: string) => [...queryKeys.restaurants.all, 'menu', restaurantId] as const,
  },
  clips: {
    all: ['clips'] as const,
    list: () => [...queryKeys.clips.all, 'list'] as const,
    byRestaurant: (restaurantId: string) =>
      [...queryKeys.clips.all, 'restaurant', restaurantId] as const,
    byMenuItem: (menuItemId: string) => [...queryKeys.clips.all, 'menuItem', menuItemId] as const,
  },
  menuItems: {
    all: ['menuItems'] as const,
    detail: (menuItemId: string) => [...queryKeys.menuItems.all, 'detail', menuItemId] as const,
  },
  people: {
    all: ['people'] as const,
    list: () => [...queryKeys.people.all, 'list'] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: () => [...queryKeys.orders.all, 'list'] as const,
    detail: (orderId: string) => [...queryKeys.orders.all, 'detail', orderId] as const,
    forRestaurant: (restaurantId: string) =>
      [...queryKeys.orders.all, 'restaurant', restaurantId] as const,
  },
  addresses: {
    all: ['addresses'] as const,
    list: () => [...queryKeys.addresses.all, 'list'] as const,
  },
} as const;
