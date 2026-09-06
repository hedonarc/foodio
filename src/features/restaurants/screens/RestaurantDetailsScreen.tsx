import { useCallback, useRef, useState } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState } from '@/components/shared';
import { CART_BAR_CLEARANCE, CartBar, type CartRestaurant } from '@/features/cart';
// Deep import, not the barrel: discovery's barrel pulls RestaurantCarousel,
// which imports this feature back — a require cycle Metro warns about.
import { RestaurantClips } from '@/features/discovery/components/RestaurantClips';
import { Menu, MenuCategoryChips, useRestaurantMenu } from '@/features/menu';

import { RestaurantGallery } from '../components/RestaurantGallery';
import { RestaurantHeader } from '../components/RestaurantHeader';
import { RestaurantHero } from '../components/RestaurantHero';
import { RestaurantHours } from '../components/RestaurantHours';
import { RestaurantInfo } from '../components/RestaurantInfo';
import { RestaurantRating } from '../components/RestaurantRating';
import { RestaurantReviewPreview } from '../components/RestaurantReviewPreview';
import { useRestaurant } from '../hooks/useRestaurant';

/** How far above a section's top the chips sit once they are pinned. */
const CHIP_ROW_HEIGHT = 52;

export function RestaurantDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isPending, error, refetch } = useRestaurant(id);
  // Cached: the Menu itself already asked for this.
  const { data: categories } = useRestaurantMenu(id);

  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef(new Map<string, number>());
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const rememberSection = useCallback((categoryId: string, y: number) => {
    offsets.current.set(categoryId, y);
  }, []);

  const scrollToCategory = (categoryId: string) => {
    const y = offsets.current.get(categoryId);
    if (y === undefined) return;

    setActiveCategoryId(categoryId);
    scrollRef.current?.scrollTo({ y: y - CHIP_ROW_HEIGHT, animated: true });
  };

  /** The last section the pinned row has passed is the one being read. */
  const trackActiveCategory = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y + CHIP_ROW_HEIGHT + 1;

    // Above the first section nothing has been passed yet, and an empty row
    // reads as broken — the first category is what a customer is looking at.
    let current: string | null = categories?.[0]?.id ?? null;
    for (const category of categories ?? []) {
      const top = offsets.current.get(category.id);
      if (top !== undefined && top <= y) current = category.id;
    }

    if (current !== activeCategoryId) setActiveCategoryId(current);
  };

  if (isPending) {
    return (
      <RestaurantDetailsShell>
        <LoadingState className="flex-1 items-center justify-center" />
      </RestaurantDetailsShell>
    );
  }

  if (error) {
    return (
      <RestaurantDetailsShell>
        <ErrorState
          error={error}
          onRetry={refetch}
          className="flex-1 items-center justify-center px-8"
        />
      </RestaurantDetailsShell>
    );
  }

  if (!restaurant) {
    return (
      <RestaurantDetailsShell>
        <EmptyState
          message={t('restaurant.notFound')}
          className="flex-1 items-center justify-center px-8"
        />
      </RestaurantDetailsShell>
    );
  }

  const cartRestaurant: CartRestaurant = {
    id: restaurant.id,
    name: restaurant.name,
    currency: restaurant.currency,
    deliveryFeeMinor: restaurant.deliveryFeeMinor,
  };

  return (
    <View className="flex-1 bg-white">
      <RestaurantHeader name={restaurant.name} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: CART_BAR_CLEARANCE }}
        // Index 3: the chips, so they pin under the header once the info above
        // them scrolls away.
        stickyHeaderIndices={[3]}
        onScroll={trackActiveCategory}
        scrollEventThrottle={16}
      >
        <RestaurantHero image={restaurant.image} name={restaurant.name} />
        <RestaurantRating rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
        <View className="border-b border-gray-100">
          <RestaurantInfo restaurant={restaurant} />
        </View>
        <MenuCategoryChips
          categories={categories ?? []}
          activeId={activeCategoryId}
          onSelect={scrollToCategory}
        />
        <Menu restaurant={cartRestaurant} onSectionLayout={rememberSection} />
        {/* After the menu — people came to order; the clips argue for it (#26). */}
        <RestaurantClips restaurantId={restaurant.id} restaurantName={restaurant.name} />
        <RestaurantGallery images={restaurant.gallery} />
        <RestaurantHours openingHours={restaurant.openingHours} />
        <RestaurantReviewPreview restaurantId={restaurant.id} reviews={restaurant.reviews} />
      </ScrollView>
      <CartBar />
    </View>
  );
}

function RestaurantDetailsShell({ children }: PropsWithChildren) {
  return (
    <View className="flex-1 bg-white">
      <RestaurantHeader name="" />
      {children}
    </View>
  );
}
