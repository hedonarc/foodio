import { ActivityIndicator, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { colors } from '@/theme';

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label, className }: LoadingStateProps) {
  const { t } = useTranslation();
  const accessibilityLabel = label ?? t('common.loading');

  return (
    <View
      className={className ?? 'items-center justify-center py-10'}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator color={colors.primary[500]} />
    </View>
  );
}
