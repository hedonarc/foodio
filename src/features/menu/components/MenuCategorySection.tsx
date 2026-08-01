import { View } from 'react-native';

import type { CartRestaurant } from '@/features/cart';

import type { MenuCategory } from '../types/menu.types';

import { MenuItemCard } from './MenuItemCard';
import { MenuSectionHeader } from './MenuSectionHeader';

type MenuCategorySectionProps = {
  category: MenuCategory;
  restaurant: CartRestaurant;
};

export function MenuCategorySection({ category, restaurant }: MenuCategorySectionProps) {
  return (
    <View>
      <MenuSectionHeader title={category.name} />
      {category.menuItems.map((item) => (
        <MenuItemCard key={item.id} item={item} restaurant={restaurant} />
      ))}
    </View>
  );
}
