import { FlatList, View } from 'react-native';

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';

import type { Restaurant } from '../types/restaurant.types';

import { RestaurantCard } from './RestaurantCard';

type RestaurantListProps = {
  restaurants: Restaurant[];
  ListHeaderComponent?: ReactElement | null;
};

export function RestaurantList({ restaurants, ListHeaderComponent }: RestaurantListProps) {
  const { t } = useTranslation();

  return (
    <FlatList
      data={restaurants}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RestaurantCard restaurant={item} />}
      contentContainerClassName="px-4 pb-8"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          {ListHeaderComponent}
          <View className="mb-3">
            <Text variant="subheading" className="text-gray-900">
              {t('home.restaurants')}
            </Text>
          </View>
        </View>
      }
    />
  );
}
