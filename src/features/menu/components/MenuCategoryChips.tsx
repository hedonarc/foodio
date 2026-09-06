import { Pressable, ScrollView } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { MenuCategory } from '../types/menu.types';

type MenuCategoryChipsProps = {
  categories: readonly MenuCategory[];
  activeId: string | null;
  onSelect: (categoryId: string) => void;
};

/**
 * Jump to a part of a long Menu.
 *
 * Bella Italia runs Popular, Pasta, Pizza and on, and the only way through it
 * was to scroll the whole thing. The row pins under the header once the header
 * scrolls away, so it is reachable from anywhere in the Menu.
 *
 * One category has nothing to jump between, so the row does not appear at all
 * rather than showing a single chip that does nothing.
 */
export function MenuCategoryChips({ categories, activeId, onSelect }: MenuCategoryChipsProps) {
  if (categories.length < 2) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="border-b border-gray-100 bg-white"
      contentContainerClassName="gap-2 px-4 py-3"
    >
      {categories.map((category) => {
        const active = category.id === activeId;

        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={cn(
              'rounded-full px-4 py-2',
              active ? 'bg-primary-500' : 'bg-gray-100 active:bg-gray-200',
            )}
          >
            <Text variant="label" className={active ? 'text-white' : 'text-gray-700'}>
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
