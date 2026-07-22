import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';

type RestaurantInfoProps = {
  cuisine: string;
  deliveryTime: string;
  deliveryFee: string;
  distance: string;
  address: string;
  description: string;
};

export function RestaurantInfo({
  cuisine,
  deliveryTime,
  deliveryFee,
  distance,
  address,
  description,
}: RestaurantInfoProps) {
  return (
    <View className="px-4 py-4">
      <Text variant="body" className="text-gray-500" numberOfLines={1}>
        {cuisine}
      </Text>

      <View className="mt-3 flex-row items-center flex-wrap gap-4">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={15} color="#6B7280" />
          <Text variant="caption" className="ml-1.5 text-gray-600 font-medium">
            {deliveryTime}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="bicycle-outline" size={15} color="#6B7280" />
          <Text variant="caption" className="ml-1.5 text-gray-600 font-medium">
            {deliveryFee} delivery
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={15} color="#6B7280" />
          <Text variant="caption" className="ml-1.5 text-gray-600 font-medium">
            {distance}
          </Text>
        </View>
      </View>

      <Text variant="body" className="mt-4 text-gray-600 leading-relaxed">
        {description}
      </Text>

      <View className="mt-3 flex-row items-start">
        <Ionicons name="map-outline" size={15} color="#9CA3AF" className="mt-0.5" />
        <Text variant="caption" className="ml-1.5 text-gray-400 flex-1">
          {address}
        </Text>
      </View>
    </View>
  );
}
