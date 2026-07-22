import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';

type RestaurantRatingProps = {
  rating: number;
  reviewCount: number;
};

export function RestaurantRating({ rating, reviewCount }: RestaurantRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
      <Text variant="heading" className="text-gray-900 mr-2">
        {rating.toFixed(1)}
      </Text>
      <View className="flex-row items-center mr-2">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={16} color="#F59E0B" />
        ))}
        {hasHalf && <Ionicons name="star-half" size={16} color="#F59E0B" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#D1D5DB" />
        ))}
      </View>
      <Text variant="caption" className="text-gray-400">
        ({reviewCount} reviews)
      </Text>
    </View>
  );
}
