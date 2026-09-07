import { Pressable } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

/**
 * Looks like the search field, is a button: search has a screen of its own,
 * and this is the door. A real input here would raise the keyboard over Home
 * and then leave for another screen, which is two things for one tap.
 */
export function SearchTrigger({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('home.searchLabel')}
      className="my-3 flex-1 flex-row items-center rounded-2xl border border-gray-200/50 bg-gray-100 px-4 py-3.5 active:bg-gray-200"
    >
      <Ionicons name="search-outline" size={20} color={colors.gray[500]} />
      <Text className="ml-3 text-gray-400">{t('home.searchPlaceholder')}</Text>
    </Pressable>
  );
}
