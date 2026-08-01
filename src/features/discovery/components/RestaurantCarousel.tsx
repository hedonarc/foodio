import { FlatList, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState } from '@/components/shared';
import { useRestaurants } from '@/features/restaurants';

import { RestaurantPreviewCard } from './RestaurantPreviewCard';
import { SectionHeader } from './SectionHeader';

type RestaurantCarouselProps = {
  query?: string;
};

/** Owns its query so a failure here does not blank the whole screen. */
export function RestaurantCarousel({ query }: RestaurantCarouselProps) {
  const { t } = useTranslation();
  const { data: restaurants, isPending, error, refetch } = useRestaurants(query);

  const isSearching = Boolean(query);
  const isEmpty = !isPending && !error && restaurants?.length === 0;

  return (
    <View className="mb-6">
      <SectionHeader
        title={isSearching ? t('home.searchResults', { query }) : t('home.restaurants')}
      />
      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {isEmpty ? (
        <EmptyState
          message={isSearching ? t('home.noResults', { query }) : t('home.noRestaurants')}
        />
      ) : null}
      {restaurants && restaurants.length > 0 ? (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          horizontal={!isSearching}
          scrollEnabled={!isSearching}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <RestaurantPreviewCard restaurant={item} wide={isSearching} />}
        />
      ) : null}
    </View>
  );
}
