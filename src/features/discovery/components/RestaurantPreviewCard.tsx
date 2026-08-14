import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Photo, Text } from '@/components/ui';
import type { RestaurantSummary } from '@/features/restaurants';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { cn } from '@/lib/cn';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

type RestaurantPreviewCardProps = {
  restaurant: RestaurantSummary;
  /** Search results read as a vertical list rather than a carousel. */
  wide?: boolean;
};

export function RestaurantPreviewCard({ restaurant, wide = false }: RestaurantPreviewCardProps) {
  const router = useRouter();
  const guard = useNavigationGuard();
  const { t, i18n } = useTranslation();

  const handlePress = () => {
    guard(() => router.push(`/restaurant/${restaurant.id}`));
  };

  const deliveryFee =
    restaurant.deliveryFeeMinor === 0
      ? t('restaurant.freeDelivery')
      : t('restaurant.deliveryFee', {
          fee: formatMoney(restaurant.deliveryFeeMinor, restaurant.currency, i18n.language),
        });

  const isOutOfRange = restaurant.isDeliverable === false;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={restaurant.name}
      className={cn(
        'overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm active:opacity-90',
        wide ? 'mb-3 w-full' : 'mr-4 w-56',
        isOutOfRange ? 'opacity-60' : '',
        /*
          The carousel is a horizontal row, so every card is stretched to the
          tallest. Without a photograph the text would sit at the top of a card
          two thirds empty, and — worse across a row — its name would land at a
          different height from every neighbour's. Anchoring to the bottom puts
          the text block exactly where the photographed cards put theirs, since
          all of them are the same height, so titles and delivery lines align
          straight across. Centring looks fine on one card and ragged in a row.

          On the card, never `flex-1` on the content: the content is the card's
          only child, and a `flex-1` only child collapses an auto-height parent
          to nothing. The wide (search) layout does not stretch, so this is a
          no-op there.
        */
        restaurant.image || wide ? '' : 'justify-end',
      )}
    >
      <Photo uri={restaurant.image} className="h-36 w-full" />

      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text variant="bodyMedium" className="flex-1 mr-2 text-gray-900" numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color={colors.warning[500]} />
            <Text variant="caption" className="ml-0.5 font-bold text-warning-700">
              {restaurant.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        <Text variant="caption" className="mt-0.5 text-gray-400" numberOfLines={1}>
          {restaurant.cuisines.join(' • ')}
        </Text>
        <View className="mt-2 flex-row items-center">
          <Ionicons name="time-outline" size={12} color={colors.gray[400]} />
          <Text variant="caption" className="ml-1 text-gray-500">
            {t('restaurant.deliveryEstimate', {
              min: restaurant.deliveryEstimate.minMinutes,
              max: restaurant.deliveryEstimate.maxMinutes,
            })}
          </Text>
          <Text variant="caption" className="mx-1.5 text-gray-300">
            •
          </Text>
          <Text variant="caption" className="text-gray-500">
            {deliveryFee}
          </Text>
        </View>
        {isOutOfRange ? (
          <View className="mt-2 self-start rounded-full bg-gray-100 px-2.5 py-1">
            <Text variant="caption" className="font-semibold text-gray-500">
              {t('restaurant.outOfRange')}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
