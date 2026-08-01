import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { selectItemCount, selectTotalMinor, useCartStore } from '@/stores/cart.store';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

/** Breathing room between the bar and whatever the system draws below it. */
const BOTTOM_GAP = 12;

/**
 * Persistent route back to the cart. Without it a customer who navigates away
 * from a restaurant has no way to reach what they already added.
 *
 * It owns its own bottom inset rather than trusting the host screen: it is a
 * floating overlay, the screens it sits on deliberately exclude the bottom edge
 * so their content can scroll under it, and Android draws edge-to-edge — so a
 * fixed padding put it underneath the navigation bar.
 */
export function CartBar() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const itemCount = useCartStore(selectItemCount);
  const totalMinor = useCartStore(selectTotalMinor);
  const currency = useCartStore((state) => state.restaurant?.currency);

  if (itemCount === 0 || !currency) return null;

  return (
    <View
      className="absolute inset-x-0 bottom-0 px-4 pt-2"
      style={{ paddingBottom: insets.bottom + BOTTOM_GAP }}
    >
      <Pressable
        onPress={() => router.push('/cart')}
        accessibilityRole="button"
        accessibilityLabel={t('cart.viewWithCount', { count: itemCount })}
        className="flex-row items-center justify-between rounded-2xl bg-primary-500 px-5 py-4 shadow-lg active:bg-primary-600"
      >
        <View className="flex-row items-center">
          <Ionicons name="bag-handle-outline" size={18} color={colors.white} />
          <Text variant="label" className="ml-2 text-white">
            {t('cart.items', { count: itemCount })}
          </Text>
        </View>
        <Text variant="label" className="text-white">
          {formatMoney(totalMinor, currency, i18n.language)}
        </Text>
      </Pressable>
    </View>
  );
}
