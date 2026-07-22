import { FlatList, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';

import type { FeaturedVideo } from '../types/restaurant.types';

import { FeaturedVideoCard } from './FeaturedVideoCard';

type FeaturedVideoCarouselProps = {
  videos: FeaturedVideo[];
};

export function FeaturedVideoCarousel({ videos }: FeaturedVideoCarouselProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-6">
      <View className="mb-3">
        <Text variant="subheading" className="text-gray-900">
          {t('home.featuredVideos')}
        </Text>
      </View>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName=""
        renderItem={({ item }) => <FeaturedVideoCard video={item} />}
      />
    </View>
  );
}
