import { View } from 'react-native';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Link, Text } from '@/components/ui';
import { logDebug } from '@/lib/logger';

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

  // Logged at the press itself, before the handler, so a silent Skip can be
  // told apart from a Skip whose handler ran and went nowhere.
  const handleSkip = () => {
    logDebug('onboarding', `SKIP pressed on ${titleKey}`);
    onSkip();
  };

  const handleAllow = () => {
    logDebug('onboarding', `ALLOW pressed on ${titleKey}`);
    onAllow();
  };

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
        <Button onPress={handleAllow}>{t('common.allow')}</Button>

        <Link onPress={handleSkip}>{t('common.skip')}</Link>
      </View>
    </SafeAreaView>
  );
}
