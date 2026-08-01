import { View } from 'react-native';

import { Text } from '@/components/ui';
import type { RestaurantMenu } from '@/features/menu/types/menu.types';

import { MenuCategorySection } from './MenuCategorySection';

type MenuCategoryProps = {
  menu: RestaurantMenu;
};

export function MenuCategory({ menu }: MenuCategoryProps) {
  if (menu.categories.length === 0) {
    return (
      <View className="px-4 py-6">
        <Text variant="body" className="text-center text-gray-400">
          No menu available.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {menu.categories.map((category) => (
        <MenuCategorySection key={category.id} category={category} />
      ))}
    </View>
  );
}
