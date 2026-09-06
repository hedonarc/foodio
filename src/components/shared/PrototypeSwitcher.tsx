import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

export type PrototypeVariant = { key: string; name: string };

type PrototypeSwitcherProps = {
  variants: readonly PrototypeVariant[];
  current: string;
};

/**
 * PROTOTYPE — not production.
 *
 * The floating pill that flips a route between design variants through its
 * `?variant=` param, so a variant is one arrow away and the URL says which one
 * is on screen. Dev builds only: it renders nothing in a release.
 */
export function PrototypeSwitcher({ variants, current }: PrototypeSwitcherProps) {
  const router = useRouter();

  if (!__DEV__) return null;

  const index = Math.max(
    0,
    variants.findIndex((variant) => variant.key === current),
  );
  const active = variants[index];
  if (!active) return null;

  const step = (by: number) => {
    const next = variants[(index + by + variants.length) % variants.length];
    if (next) router.setParams({ variant: next.key });
  };

  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 bottom-3 items-center">
      <View
        className="flex-row items-center rounded-full bg-gray-900 py-1.5 pl-1 pr-1"
        style={{ elevation: 8 }}
      >
        <Pressable
          onPress={() => step(-1)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Previous variant"
          className="p-1.5"
        >
          <Ionicons name="chevron-back" size={18} color={colors.white} />
        </Pressable>
        <Text variant="label" className="mx-1 text-white">
          {active.key} — {active.name}
        </Text>
        <Pressable
          onPress={() => step(1)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Next variant"
          className="p-1.5"
        >
          <Ionicons name="chevron-forward" size={18} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}
