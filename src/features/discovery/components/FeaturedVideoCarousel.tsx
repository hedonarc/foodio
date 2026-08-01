import { FlatList, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { ErrorState, LoadingState } from '@/components/shared';
import { Text } from '@/components/ui';

import { useFeaturedVideos } from '../hooks/useFeaturedVideos';

import { FeaturedVideoCard } from './FeaturedVideoCard';

export function FeaturedVideoCarousel() {
  const { t } = useTranslation();
  const { data: videos, isPending, error, refetch } = useFeaturedVideos();

  // Promotional: an empty shelf draws attention to the gap.
  if (!isPending && !error && (!videos || videos.length === 0)) return null;

  return (
    <View className="mb-6">
      <View className="mb-3">
        <Text variant="subheading" className="text-gray-900">
          {t('home.featuredVideos')}
        </Text>
      </View>
      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {videos && videos.length > 0 ? (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <FeaturedVideoCard video={item} />}
        />
      ) : null}
    </View>
  );
}
