import { Pressable } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { colors } from '@/theme';

/**
 * The one way into the Manage hub, sitting in the kitchen header rather than
 * the tab bar — see t4. Both tabs are service-critical and this is not.
 */
export function ManageButton() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/manage')}
      accessibilityRole="button"
      accessibilityLabel={t('manage.open')}
      className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
    >
      <Ionicons name="settings-outline" size={18} color={colors.gray[700]} />
    </Pressable>
  );
}
