import { FlatList, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { RestaurantPreview } from '../types/discovery.types';

import { RestaurantPreviewCard } from './RestaurantPreviewCard';
import { SectionHeader } from './SectionHeader';

type RestaurantCarouselProps = {
  restaurants: RestaurantPreview[];
};

export function RestaurantCarousel({ restaurants }: RestaurantCarouselProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-6">
      <SectionHeader title={t('home.restaurants')} />
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <RestaurantPreviewCard restaurant={item} />}
      />
    </View>
  );
}
