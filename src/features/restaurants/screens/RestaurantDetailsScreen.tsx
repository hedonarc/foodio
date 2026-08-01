import { ScrollView, View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/shared';
import { CartBar, type CartRestaurant } from '@/features/cart';
import { Menu } from '@/features/menu';

import { RestaurantGallery } from '../components/RestaurantGallery';
import { RestaurantHeader } from '../components/RestaurantHeader';
import { RestaurantHero } from '../components/RestaurantHero';
import { RestaurantHours } from '../components/RestaurantHours';
import { RestaurantInfo } from '../components/RestaurantInfo';
import { RestaurantRating } from '../components/RestaurantRating';
import { RestaurantReviewPreview } from '../components/RestaurantReviewPreview';
import { useRestaurant } from '../hooks/useRestaurant';

/** Height of the CartBar overlay, so scrolled content can clear it. */
const CART_BAR_CLEARANCE = 96;

export function RestaurantDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: restaurant, isPending, error, refetch } = useRestaurant(id);

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

  // What a cart line needs to bind itself to this restaurant.
  const cartRestaurant: CartRestaurant = {
    id: restaurant.id,
    name: restaurant.name,
    currency: restaurant.currency,
    deliveryFeeMinor: restaurant.deliveryFeeMinor,
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <RestaurantHeader name={restaurant.name} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + CART_BAR_CLEARANCE }}
      >
        <RestaurantHero image={restaurant.image} name={restaurant.name} />
        <RestaurantRating rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
        <View className="border-b border-gray-100">
          <RestaurantInfo restaurant={restaurant} />
        </View>
        <Menu restaurant={cartRestaurant} />
        <RestaurantGallery images={restaurant.gallery} />
        <RestaurantHours openingHours={restaurant.openingHours} />
        <RestaurantReviewPreview reviews={restaurant.reviews} />
      </ScrollView>
      <CartBar />
    </SafeAreaView>
  );
}

/** Keeps the back button reachable while the restaurant name is still unknown. */
function RestaurantDetailsShell({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <RestaurantHeader name="" />
      {children}
    </SafeAreaView>
  );
}
