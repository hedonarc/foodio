import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import type { RestaurantPreview } from '@/features/discovery';

type RestaurantPreviewCardProps = {
  restaurant: RestaurantPreview;
};

export function RestaurantPreviewCard({ restaurant }: RestaurantPreviewCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      className="mr-4 w-56 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 active:opacity-90"
    >
      <View className="h-36 w-full bg-gray-200">
        <Image
          source={{ uri: restaurant.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
      </View>
      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text variant="bodyMedium" className="flex-1 mr-2 text-gray-900" numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text variant="caption" className="ml-0.5 font-bold text-amber-700">
              {restaurant.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        <Text variant="caption" className="mt-0.5 text-gray-400" numberOfLines={1}>
          {restaurant.cuisine}
        </Text>
        <View className="mt-2 flex-row items-center">
          <Ionicons name="time-outline" size={12} color="#9CA3AF" />
          <Text variant="caption" className="ml-1 text-gray-500">
            {restaurant.deliveryTime}
          </Text>
          <Text variant="caption" className="mx-1.5 text-gray-300">
            •
          </Text>
          <Text variant="caption" className="text-gray-500">
            {restaurant.deliveryFee}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
