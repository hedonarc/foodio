import { View } from 'react-native';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Link, Text } from '@/components/ui';

export type PermissionScreenProps = {
  illustration: ReactNode;
  titleKey: string;
  descriptionKey: string;
  onAllow: () => void;
  onSkip: () => void;
};

/** Space below the buttons when the system draws nothing under them. */
const BOTTOM_GAP = 24;

export function PermissionScreen({
  illustration,
  titleKey,
  descriptionKey,
  onAllow,
  onSkip,
}: PermissionScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    // The bottom edge is handled below rather than here, so the gap under the
    // buttons is explicit and the same on both platforms. Android draws
    // edge-to-edge, and with three-button navigation the bar is tall enough to
    // cover them entirely.
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="flex-1 items-center justify-center px-8">
        {illustration}

        <Text variant="heading" className="mt-8 text-center text-gray-900">
          {t(titleKey)}
        </Text>

        <Text variant="body" className="mt-4 text-center text-gray-500">
          {t(descriptionKey)}
        </Text>
      </View>

      <View className="gap-4 px-8" style={{ paddingBottom: insets.bottom + BOTTOM_GAP }}>
        <Button onPress={onAllow}>{t('common.allow')}</Button>

        <Link onPress={onSkip}>{t('common.skip')}</Link>
      </View>
    </SafeAreaView>
  );
}
