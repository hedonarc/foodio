import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import type { RestaurantSummary } from '@/features/restaurants';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

type RestaurantPreviewCardProps = {
  restaurant: RestaurantSummary;
};

export function RestaurantPreviewCard({ restaurant }: RestaurantPreviewCardProps) {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const handlePress = () => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  const deliveryFee =
    restaurant.deliveryFeeMinor === 0
      ? t('restaurant.freeDelivery')
      : t('restaurant.deliveryFee', {
          fee: formatMoney(restaurant.deliveryFeeMinor, restaurant.currency, i18n.language),
        });

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={restaurant.name}
      className="mr-4 w-56 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 active:opacity-90"
    >
      <View className="h-36 w-full bg-gray-200">
        <Image
          source={{ uri: restaurant.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />
      </View>
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
      </View>
    </Pressable>
  );
}
