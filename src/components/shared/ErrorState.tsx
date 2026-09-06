import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { ApiError } from '@/api/errors';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme';

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
  className?: string;
};

/** Offers retry only when retrying could plausibly help. */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const { t } = useTranslation();

  const message = error instanceof ApiError ? error.message : t('errors.unknown');
  const canRetry = onRetry !== undefined && (!(error instanceof ApiError) || error.isRetryable);

  /**
   * The icon follows the same signal as the retry button.
   *
   * A cloud with a line through it says "you are offline", and for a rule the
   * server stated plainly — this restaurant is closed, another account has that
   * number — that is a lie the customer then acts on, by checking their signal
   * instead of reading the sentence underneath.
   */
  const reachedUs = error instanceof ApiError && !error.isRetryable;
  const icon = reachedUs ? 'alert-circle-outline' : 'cloud-offline-outline';

  return (
    <View
      className={className ?? 'items-center justify-center px-8 py-10'}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Ionicons name={icon} size={28} color={colors.gray[400]} />
      <Text variant="body" className="mt-3 text-center text-gray-500">
        {message}
      </Text>
      {canRetry ? (
        <Button variant="secondary" onPress={onRetry} className="mt-4">
          {t('common.retry')}
        </Button>
      ) : null}
    </View>
  );
}
