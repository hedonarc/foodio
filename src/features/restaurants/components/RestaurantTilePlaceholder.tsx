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
 *
 * Icon beside the initial rather than above it. Stacked, the two read as one
 * damaged glyph — a fork growing out of the letter — instead of as a mark and a
 * letter. Side by side they are plainly two things, and the pair centres in the
 * tile the way a logo would.
 */
export function RestaurantTilePlaceholder({ name, className }: RestaurantTilePlaceholderProps) {
  return (
    <View
      className={cn('flex-row items-center justify-center gap-2 bg-primary-50', className)}
      accessibilityLabel={name}
    >
      <Ionicons name="restaurant-outline" size={26} color={colors.primary[200]} />
      <Text className="text-[34px] font-bold leading-10 text-primary-300">{initialOf(name)}</Text>
    </View>
  );
}
