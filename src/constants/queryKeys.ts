export const queryKeys = {
  restaurants: {
    all: ['restaurants'] as const,
    list: (query?: string) => [...queryKeys.restaurants.all, 'list', query ?? ''] as const,
    detail: (restaurantId: string) =>
      [...queryKeys.restaurants.all, 'detail', restaurantId] as const,
    menu: (restaurantId: string) => [...queryKeys.restaurants.all, 'menu', restaurantId] as const,
  },
  featuredVideos: {
    all: ['featuredVideos'] as const,
    list: () => [...queryKeys.featuredVideos.all, 'list'] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: () => [...queryKeys.orders.all, 'list'] as const,
    detail: (orderId: string) => [...queryKeys.orders.all, 'detail', orderId] as const,
  },
} as const;
