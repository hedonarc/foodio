import { View } from 'react-native';

import type { MenuCategory } from '../types/menu.types';

import { MenuItemCard } from './MenuItemCard';
import { MenuSectionHeader } from './MenuSectionHeader';

type MenuCategorySectionProps = {
  category: MenuCategory;
  currency: string;
};

export function MenuCategorySection({ category, currency }: MenuCategorySectionProps) {
  return (
    <View>
      <MenuSectionHeader title={category.name} />
      {category.menuItems.map((item) => (
        <MenuItemCard key={item.id} item={item} currency={currency} />
      ))}
    </View>
  );
}
