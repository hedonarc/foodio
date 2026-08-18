import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

type ScreenHeaderProps = {
  title: string;
  action?: ReactNode;
  /** Tab screens have nowhere to go back to. */
  showBack?: boolean;
  /** Overrides the pop, for a screen whose back means "the previous step". */
  onBack?: () => void;
};

export function ScreenHeader({ title, action, showBack = true, onBack }: ScreenHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-row items-center px-4 py-3">
      {showBack ? (
        <Pressable
          onPress={onBack ?? (() => router.back())}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
        >
          <Ionicons name="chevron-back" size={20} color={colors.gray[900]} />
        </Pressable>
      ) : null}
      <Text variant="subheading" className="flex-1 text-gray-900" numberOfLines={1}>
        {title}
      </Text>
      {action}
    </View>
  );
}
