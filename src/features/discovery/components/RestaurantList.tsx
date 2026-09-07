import { FlashList } from '@shopify/flash-list';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useActiveAddress } from '@/features/checkout/hooks/useActiveAddress';
import { useRestaurants } from '@/features/restaurants';

import { RestaurantPreviewCard } from './RestaurantPreviewCard';
import { SectionHeader } from './SectionHeader';

type RestaurantListProps = {
  /** The search field and the carousel, scrolled with the list rather than above it. */
  header: ReactElement;
  refreshing: boolean;
  onRefresh: () => void;
};

/**
 * Every Restaurant, under the carousel — the "All restaurants" half of the
 * chosen design that was never built. Home was a single horizontal row above
 * two thirds of empty screen, which is a poor showing for the surface whose job
 * is Discovery.
 *
 * It owns the scrolling for the whole screen: the search field and the carousel
 * ride along as the header, because a FlashList inside a ScrollView virtualises
 * nothing and warns about it.
 *
 * The same request the carousel makes, so the rows come from cache rather than
 * a second round trip.
 */
export function RestaurantList({ header, refreshing, onRefresh }: RestaurantListProps) {
  const { t } = useTranslation();
  const { address } = useActiveAddress();
  const coordinates = address
    ? { latitude: address.latitude, longitude: address.longitude }
    : undefined;
  const { data: restaurants } = useRestaurants(undefined, coordinates);
  const rows = restaurants ?? [];

  return (
    <FlashList
      data={rows}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RestaurantPreviewCard restaurant={item} wide />}
      ListHeaderComponent={
        <>
          {header}
          {rows.length > 0 ? (
            <SectionHeader title={t('home.allRestaurants', { count: rows.length })} />
          ) : null}
        </>
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerClassName="pb-6"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}
