import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';

import type { RestaurantHour } from '../types/restaurant.types';

type RestaurantHoursProps = {
  hours: RestaurantHour[];
};

export function RestaurantHours({ hours }: RestaurantHoursProps) {
  return (
    <View className="mx-4 my-4 rounded-2xl bg-gray-50 p-4">
      <View className="mb-3 flex-row items-center">
        <Ionicons name="time-outline" size={16} color="#6B7280" />
        <Text variant="bodyMedium" className="ml-2 text-gray-900">
          Hours
        </Text>
      </View>
      {hours.map((item) => (
        <View key={item.day} className="mb-1.5 flex-row justify-between">
          <Text variant="caption" className="text-gray-600 font-medium">
            {item.day}
          </Text>
          <Text variant="caption" className="text-gray-500">
            {item.hours}
          </Text>
        </View>
      ))}
    </View>
  );
}
