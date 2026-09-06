// PROTOTYPE — not production. See HomePrototype.tsx.
import type { RestaurantSummary } from '@/features/restaurants';

export type Category = {
  name: string;
  emoji: string;
  count: number;
  /** A photograph from a Restaurant that serves it, for the tile variants. */
  image: string;
};

const EMOJI: Record<string, string> = {
  Pizza: '🍕',
  Burgers: '🍔',
  Sushi: '🍣',
  Salads: '🥗',
  Healthy: '🥗',
  Desserts: '🍰',
  Cakes: '🎂',
  Pastries: '🥐',
  Coffee: '☕',
  Tacos: '🌮',
  Burritos: '🌯',
  Mexican: '🌮',
  Italian: '🍝',
  Pasta: '🍝',
  Japanese: '🍱',
  Ramen: '🍜',
  Noodles: '🍜',
  Pho: '🍜',
  'Pad Thai': '🍜',
  Chinese: '🥡',
  'Dim Sum': '🥟',
  Thai: '🍛',
  Curry: '🍛',
  Indian: '🍛',
  Biryani: '🍛',
  American: '🍟',
  Fries: '🍟',
  BBQ: '🍖',
  Vietnamese: '🥢',
  'Banh Mi': '🥖',
  Smoothies: '🥤',
};

/** The cuisines the loaded Restaurants actually serve, most common first. */
export function categoriesFrom(restaurants: readonly RestaurantSummary[]): Category[] {
  const byName = new Map<string, Category>();

  for (const restaurant of restaurants) {
    for (const cuisine of restaurant.cuisines) {
      const existing = byName.get(cuisine);
      if (existing) {
        existing.count += 1;
        if (!existing.image && restaurant.image) existing.image = restaurant.image;
      } else {
        byName.set(cuisine, {
          name: cuisine,
          emoji: EMOJI[cuisine] ?? '🍽️',
          count: 1,
          image: restaurant.image,
        });
      }
    }
  }

  return [...byName.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
