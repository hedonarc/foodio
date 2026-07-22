import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';

import { MOCK_MENUS } from '../data/menu.mock';

import { MenuCategory } from './MenuCategory';

type MenuProps = {
  restaurantId: string;
};

export function Menu({ restaurantId }: MenuProps) {
  const { t } = useTranslation();
  const menu = MOCK_MENUS[restaurantId];

  if (!menu) return null;

  return (
    <View className="px-4 pb-4">
      <Text variant="bodyMedium" className="mb-1 text-gray-900">
        {t('menu.title')}
      </Text>
      <MenuCategory menu={menu} />
    </View>
  );
}
