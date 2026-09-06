// PROTOTYPE — not production. Small pieces the variants share; layout stays theirs.
import { Pressable, TextInput, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Photo, Text } from '@/components/ui';
import { queryKeys } from '@/constants/queryKeys';
import type { RestaurantSummary } from '@/features/restaurants';
import { RestaurantTilePlaceholder } from '@/features/restaurants';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { cn } from '@/lib/cn';
import { colors } from '@/theme';

export const HOME_KEYS = [queryKeys.restaurants.all, queryKeys.clips.all] as const;

export const PLACEHOLDER = 'Search for food or restaurants...';

type ChipProps = {
  label: string;
  on?: boolean;
  leading?: string;
  trailingIcon?: 'close';
  onPress: () => void;
};

export function Chip({ label, on = false, leading, trailingIcon, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      className={cn(
        'mr-2 flex-row items-center rounded-full border px-3.5 py-2',
        on ? 'border-primary-500 bg-primary-500' : 'border-gray-200 bg-white',
      )}
    >
      {leading ? <Text className="mr-1.5 text-sm">{leading}</Text> : null}
      <Text variant="label" className={on ? 'text-white' : 'text-gray-800'}>
        {label}
      </Text>
      {trailingIcon ? (
        <Ionicons
          name="close"
          size={14}
          color={on ? colors.white : colors.gray[500]}
          style={{ marginLeft: 6 }}
        />
      ) : null}
    </Pressable>
  );
}

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
};

export function SearchField({
  value,
  onChange,
  onClear,
  onSubmit,
  onFocus,
  autoFocus = false,
}: SearchFieldProps) {
  return (
    <View className="flex-1 flex-row items-center rounded-2xl bg-gray-100 px-4">
      <Ionicons name="search-outline" size={20} color={colors.gray[500]} />
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
        onSubmitEditing={onSubmit}
        placeholder={PLACEHOLDER}
        placeholderTextColor={colors.gray[400]}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search restaurants"
        className="ml-3 flex-1 py-3 text-base text-gray-900"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={onClear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear"
        >
          <Ionicons name="close-circle" size={18} color={colors.gray[400]} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** The search bar as a button: tapping it opens the variant's search surface. */
export function SearchTrigger({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Search"
      className="my-3 flex-1 flex-row items-center rounded-2xl border border-gray-200/50 bg-gray-100 px-4 py-3.5 active:bg-gray-200"
    >
      <Ionicons name="search-outline" size={20} color={colors.gray[500]} />
      <Text className="ml-3 text-gray-400">{PLACEHOLDER}</Text>
    </Pressable>
  );
}

/** A compact result: thumbnail left, the facts on one line. */
export function ResultRow({ restaurant }: { restaurant: RestaurantSummary }) {
  const router = useRouter();
  const guard = useNavigationGuard();
  const fee =
    restaurant.deliveryFeeMinor === 0
      ? 'Free delivery'
      : `PKR ${(restaurant.deliveryFeeMinor / 100).toFixed(0)} delivery`;

  return (
    <Pressable
      onPress={() => guard(() => router.push(`/restaurant/${restaurant.id}`))}
      accessibilityRole="button"
      accessibilityLabel={restaurant.name}
      className="flex-row items-center py-2.5 active:opacity-80"
    >
      {restaurant.image ? (
        <Photo uri={restaurant.image} className="h-16 w-16 rounded-xl" />
      ) : (
        <RestaurantTilePlaceholder name={restaurant.name} className="h-16 w-16 rounded-xl" />
      )}
      <View className="ml-3 flex-1">
        <Text variant="bodyMedium" className="text-gray-900" numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text variant="caption" className="mt-0.5 text-gray-400" numberOfLines={1}>
          {restaurant.cuisines.join(' • ')}
        </Text>
        <View className="mt-1 flex-row items-center">
          <Ionicons name="star" size={11} color={colors.warning[500]} />
          <Text variant="caption" className="ml-0.5 font-bold text-warning-700">
            {restaurant.reviewCount === 0 ? 'New' : restaurant.rating.toFixed(1)}
          </Text>
          <Text variant="caption" className="mx-1.5 text-gray-300">
            •
          </Text>
          <Text variant="caption" className="text-gray-500">
            {restaurant.deliveryEstimate.minMinutes}–{restaurant.deliveryEstimate.maxMinutes} min
          </Text>
          <Text variant="caption" className="mx-1.5 text-gray-300">
            •
          </Text>
          <Text variant="caption" className="text-gray-500">
            {fee}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.gray[300]} />
    </Pressable>
  );
}
