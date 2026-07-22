import { View } from 'react-native';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Link, Text } from '@/components/ui';

export type PermissionScreenProps = {
  illustration: ReactNode;
  titleKey: string;
  descriptionKey: string;
  onAllow: () => void;
  onSkip: () => void;
};

export function PermissionScreen({
  illustration,
  titleKey,
  descriptionKey,
  onAllow,
  onSkip,
}: PermissionScreenProps) {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        {illustration}

        <Text variant="heading" className="mt-8 text-center text-gray-900">
          {t(titleKey)}
        </Text>

        <Text variant="body" className="mt-4 text-center text-gray-500">
          {t(descriptionKey)}
        </Text>
      </View>

      <View className="gap-4 px-8 pb-12">
        <Button onPress={onAllow}>{t('common.allow')}</Button>

        <Link onPress={onSkip}>{t('common.skip')}</Link>
      </View>
    </SafeAreaView>
  );
}
