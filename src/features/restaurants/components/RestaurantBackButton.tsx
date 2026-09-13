import { Pressable } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { colors } from '@/theme';

/**
 * Floats over the photograph and stays put while the page scrolls, so the way
 * back is reachable from anywhere in the menu without a header bar spending
 * the top of the page on the name — which the page says in large type anyway.
 */
export function RestaurantBackButton() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
      hitSlop={8}
      className="absolute left-4 top-3 h-10 w-10 items-center justify-center rounded-full bg-white/90 active:bg-white"
      style={{ zIndex: 10, elevation: 3 }}
    >
      <Ionicons name="chevron-back" size={22} color={colors.gray[900]} />
    </Pressable>
  );
}
