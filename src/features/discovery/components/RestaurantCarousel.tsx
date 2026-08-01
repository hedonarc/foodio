import { FlatList, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState } from '@/components/shared';
import { useRestaurants } from '@/features/restaurants';

import { RestaurantPreviewCard } from './RestaurantPreviewCard';
import { SectionHeader } from './SectionHeader';

/** Owns its query so a failure here does not blank the whole screen. */
export function RestaurantCarousel() {
  const { t } = useTranslation();
  const { data: restaurants, isPending, error, refetch } = useRestaurants();

  return (
    <View className="mb-6">
      <SectionHeader title={t('home.restaurants')} />
      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {!isPending && !error && restaurants?.length === 0 ? (
        <EmptyState message={t('home.noRestaurants')} />
      ) : null}
      {restaurants && restaurants.length > 0 ? (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <RestaurantPreviewCard restaurant={item} />}
        />
      ) : null}
    </View>
  );
}
