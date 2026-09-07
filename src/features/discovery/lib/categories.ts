import type { RestaurantSummary } from '@/features/restaurants';

export type Category = {
  name: string;
  emoji: string;
  /** How many of the loaded Restaurants serve it — the rail's order. */
  count: number;
};

/**
 * Cuisine names are free text a Restaurant typed for itself, so the rail can
 * only ever be as tidy as the data. Unknown names fall back to a plate rather
 * than to nothing — a category with no picture reads as broken.
 */
const EMOJI_BY_CUISINE: Record<string, string> = {
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

const FALLBACK_EMOJI = '🍽️';

/**
 * The cuisines the loaded Restaurants actually serve, most common first and
 * alphabetical within a tie, so the rail never shows a cuisine nobody cooks.
 */
export function categoriesFrom(restaurants: readonly RestaurantSummary[]): Category[] {
  const counts = new Map<string, number>();
  for (const restaurant of restaurants) {
    for (const cuisine of restaurant.cuisines) {
      counts.set(cuisine, (counts.get(cuisine) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, emoji: EMOJI_BY_CUISINE[name] ?? FALLBACK_EMOJI }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
