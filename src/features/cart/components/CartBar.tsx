import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { selectItemCount, selectTotalMinor, useCartStore } from '@/stores/cart.store';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

/** Space a screen must reserve below its content so the bar covers nothing. */
export const CART_BAR_CLEARANCE = 96;

/**
 * The tab-less fallback: where the tab bar is hidden, this carries the cart.
 * Screens with the tab bar use the Cart tab instead — never both.
 */
export function CartBar() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const guard = useNavigationGuard();

  const itemCount = useCartStore(selectItemCount);
  const totalMinor = useCartStore(selectTotalMinor);
  const currency = useCartStore((state) => state.restaurant?.currency);

  if (itemCount === 0 || !currency) return null;

  return (
    <View className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-2">
      <Pressable
        onPress={() => guard(() => router.push('/cart'))}
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
