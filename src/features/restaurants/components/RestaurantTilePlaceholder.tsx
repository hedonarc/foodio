import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { colors } from '@/theme';
import { initialOf } from '@/utils/initials';

type RestaurantTilePlaceholderProps = {
  name: string;
  /** Sizing of the frame it stands in for. */
  className?: string;
};

/**
 * Stands in for a restaurant that has not set a photograph.
 *
 * A tile sits in a row beside tiles that do have one, and an empty slot there
 * reads as broken rather than as absent — which is why this exists and the
 * menu row, whose neighbours are all text, does not have one.
 *
 * Deliberately not a stock food photograph: a customer would reasonably take
 * that for a picture of the food. An initial says "no photograph yet" without
 * pretending to be one.
 */
export function RestaurantTilePlaceholder({ name, className }: RestaurantTilePlaceholderProps) {
  return (
    <View className={cn('items-center justify-center bg-primary-50', className)}>
      <Ionicons name="restaurant-outline" size={20} color={colors.primary[200]} />
      <Text className="mt-1 text-[34px] font-bold leading-10 text-primary-300">
        {initialOf(name)}
      </Text>
    </View>
  );
}
