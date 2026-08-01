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

/**
 * Surfaces the message the API layer already normalised, rather than a raw
 * exception. Retry is offered only when retrying could plausibly help — a 404
 * or a contract mismatch will fail identically every time.
 */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const { t } = useTranslation();

  const message = error instanceof ApiError ? error.message : t('errors.unknown');
  const canRetry = onRetry !== undefined && (!(error instanceof ApiError) || error.isRetryable);

  return (
    <View
      className={className ?? 'items-center justify-center px-8 py-10'}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Ionicons name="cloud-offline-outline" size={28} color={colors.gray[400]} />
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
