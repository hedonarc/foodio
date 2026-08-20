import { Alert, ScrollView, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { ErrorState, LoadingState, ScreenHeader } from '@/components/shared';
import { Button, Text } from '@/components/ui';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

import { useChangePlan, usePlans } from '../hooks/usePlans';
import { useSubscription } from '../hooks/useSubscription';

/**
 * What this Chain pays, and how to move between tiers.
 *
 * Reachable at all because [t21] found that a Chain could never leave Starter:
 * a subscription opens on claim and the API refuses a second, so the branch
 * limit was unreachable by construction.
 */
export function ManageSubscriptionScreen() {
  const { t, i18n } = useTranslation();

  const role = useSessionStore((state) => state.role);
  const restaurantId = role.kind === 'kitchen' ? role.restaurantId : '';

  const { data: subscription, isPending, error, refetch } = useSubscription(restaurantId);
  const { data: plans } = usePlans();
  const change = useChangePlan(restaurantId);

  if (isPending) return <LoadingState className="flex-1 items-center justify-center" />;
  if (error || !subscription) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        className="flex-1 items-center justify-center px-8"
      />
    );
  }

  const money = (minor: number, currency: string) => formatMoney(minor, currency, i18n.language);

  const confirm = (code: string, name: string) =>
    Alert.alert(
      t('manage.subscription.confirmTitle'),
      t('manage.subscription.confirmBody', { name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('manage.subscription.confirmAction'),
          onPress: () =>
            change.mutate(code, {
              onError: (cause) =>
                Alert.alert(t('manage.subscription.failed'), toApiError(cause).message),
            }),
        },
      ],
    );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t('manage.subscription.title')} />

      <ScrollView contentContainerClassName="gap-4 px-4 pb-10">
        <View className="gap-1 rounded-2xl bg-primary-50 p-4">
          <Text variant="caption" className="text-primary-700">
            {t(`manage.subscription.status.${subscription.status}`)}
          </Text>
          <Text variant="subheading" className="text-gray-900">
            {subscription.planName}
          </Text>
          <Text variant="caption" className="text-gray-600">
            {t('manage.subscription.perMonth', {
              price: money(subscription.priceMinor, subscription.currency),
            })}
          </Text>
        </View>

        <Text variant="label" className="text-gray-500">
          {t('manage.subscription.choose')}
        </Text>

        {plans?.map((plan) => {
          const current = plan.code === subscription.planCode;

          return (
            <View
              key={plan.code}
              className={
                current
                  ? 'gap-2 rounded-2xl border-2 border-primary-500 p-4'
                  : 'gap-2 rounded-2xl border border-gray-200 p-4'
              }
            >
              <View className="flex-row items-center gap-2">
                <Text variant="bodyMedium" className="flex-1 text-gray-900">
                  {plan.name}
                </Text>
                <Text variant="bodyMedium" className="text-gray-900">
                  {money(plan.priceMinor, plan.currency)}
                </Text>
              </View>

              <View className="flex-row items-center gap-1.5">
                <Ionicons name="storefront-outline" size={13} color={colors.gray[500]} />
                <Text variant="caption" className="text-gray-500">
                  {t('manage.subscription.locations', { count: plan.branchLimit })}
                </Text>
              </View>

              {current ? (
                <Text variant="caption" className="font-semibold text-primary-600">
                  {t('manage.subscription.current')}
                </Text>
              ) : (
                <Button
                  variant="secondary"
                  onPress={() => confirm(plan.code, plan.name)}
                  disabled={change.isPending}
                >
                  {t('manage.subscription.switchTo', { name: plan.name })}
                </Button>
              )}
            </View>
          );
        })}

        {/* No proration, and saying so beats a surprise on the next invoice. */}
        <Text variant="caption" className="text-gray-400">
          {t('manage.subscription.prorationHint')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
