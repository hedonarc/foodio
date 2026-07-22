import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';

import type { Restaurant } from '../types/restaurant.types';

type RestaurantCardProps = {
  restaurant: Restaurant;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 active:opacity-95"
    >
      <View className="h-44 w-full bg-gray-200">
        <Image
          source={{ uri: restaurant.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
      </View>
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <Text variant="subheading" className="text-gray-900 flex-1 mr-2" numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View className="flex-row items-center rounded-full bg-amber-50 px-2 py-1 border border-amber-200/60">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text variant="caption" className="ml-1 font-bold text-amber-700">
              {restaurant.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text variant="body" className="mt-1 text-sm text-gray-500" numberOfLines={1}>
          {restaurant.cuisine}
        </Text>

        <View className="mt-3 flex-row items-center text-xs text-gray-500">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text variant="caption" className="ml-1 text-gray-600 font-medium">
              {restaurant.deliveryTime}
            </Text>
          </View>

          <Text variant="caption" className="mx-2 text-gray-300">
            •
          </Text>

          <Text variant="caption" className="text-gray-600 font-medium">
            {restaurant.deliveryFee}
          </Text>

          <Text variant="caption" className="mx-2 text-gray-300">
            •
          </Text>

          <Text variant="caption" className="text-gray-600 font-medium">
            {restaurant.distance}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
