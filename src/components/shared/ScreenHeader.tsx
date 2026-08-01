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
};

export function ScreenHeader({ title, action }: ScreenHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-row items-center px-4 py-3">
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
      >
        <Ionicons name="chevron-back" size={20} color={colors.gray[900]} />
      </Pressable>
      <Text variant="subheading" className="flex-1 text-gray-900" numberOfLines={1}>
        {title}
      </Text>
      {action}
    </View>
  );
}
