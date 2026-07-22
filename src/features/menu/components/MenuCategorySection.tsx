import { View } from 'react-native';

import type { MenuCategory } from '@/features/menu/types/menu.types';

import { MenuItemCard } from './MenuItemCard';
import { MenuSectionHeader } from './MenuSectionHeader';

type MenuCategorySectionProps = {
  category: MenuCategory;
};

export function MenuCategorySection({ category }: MenuCategorySectionProps) {
  return (
    <View>
      <MenuSectionHeader title={category.name} />
      {category.items.map((item) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </View>
  );
}
