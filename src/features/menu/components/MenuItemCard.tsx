import { View } from 'react-native';

import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import type { MenuItem } from '@/features/menu/types/menu.types';

import { MenuPrice } from './MenuPrice';

type MenuItemCardProps = {
  item: MenuItem;
};

export function MenuItemCard({ item }: MenuItemCardProps) {
  return (
    <View className="flex-row items-start py-3">
      <View className="mr-3 h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200">
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text variant="bodyMedium" className="flex-1 text-gray-900" numberOfLines={1}>
            {item.name}
          </Text>
          {item.isPopular ? (
            <View className="ml-2 rounded-full bg-amber-100 px-2 py-0.5">
              <Text variant="caption" className="font-semibold text-amber-700">
                Popular
              </Text>
            </View>
          ) : null}
        </View>
        {item.rating !== undefined ? (
          <View className="mt-0.5 flex-row items-center">
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text variant="caption" className="ml-0.5 font-semibold text-amber-700">
              {item.rating.toFixed(1)}
            </Text>
          </View>
        ) : null}
        <Text variant="caption" className="mt-1 text-gray-500" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="mt-2">
          <MenuPrice price={item.price} />
        </View>
      </View>
    </View>
  );
}
