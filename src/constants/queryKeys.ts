export const queryKeys = {
  restaurants: {
    all: ['restaurants'] as const,
    list: () => [...queryKeys.restaurants.all, 'list'] as const,
    detail: (restaurantId: string) =>
      [...queryKeys.restaurants.all, 'detail', restaurantId] as const,
    menu: (restaurantId: string) => [...queryKeys.restaurants.all, 'menu', restaurantId] as const,
  },
  featuredVideos: {
    all: ['featuredVideos'] as const,
    list: () => [...queryKeys.featuredVideos.all, 'list'] as const,
  },
} as const;
