import { Alert, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { ErrorState, LoadingState, ScreenHeader } from '@/components/shared';
import { Button, Text } from '@/components/ui';
import { useRestaurantMenu } from '@/features/menu/hooks/useRestaurantMenu';
import type { Restaurant } from '@/features/restaurants';
import { useRestaurant } from '@/features/restaurants';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';

import { useUpdateRestaurant } from '../hooks/useUpdateRestaurant';
import { blockerFor, canChangeStatus, looksShutToCustomers } from '../lib/goingLive';

/**
 * Whether customers can find this restaurant, and why not when they cannot.
 *
 * The rule itself lives in the API (t2), and deliberately stays there — a rule
 * only the app knows is not a rule. This screen explains the state and offers
 * the switch; every refusal it shows comes from the server.
 */
export function ManageGoingLiveScreen() {
  const role = useSessionStore((state) => state.role);
  const restaurantId = role.kind === 'kitchen' ? role.restaurantId : '';

  const { data: restaurant, isPending, error, refetch } = useRestaurant(restaurantId);
  const { data: menu } = useRestaurantMenu(restaurantId);

  if (isPending) return <LoadingState className="flex-1 items-center justify-center" />;
  if (error || !restaurant) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        className="flex-1 items-center justify-center px-8"
      />
    );
  }

  const dishCount = (menu ?? []).reduce((total, category) => total + category.menuItems.length, 0);

  return (
    <GoingLive restaurant={restaurant} dishCount={dishCount} menuLoaded={menu !== undefined} />
  );
}

type GoingLiveProps = { restaurant: Restaurant; dishCount: number; menuLoaded: boolean };

function GoingLive({ restaurant, dishCount, menuLoaded }: GoingLiveProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const update = useUpdateRestaurant(restaurant.id);

  const { status } = restaurant;
  const blocker = blockerFor(dishCount);
  const shutLooking = looksShutToCustomers(restaurant);

  const setStatus = (next: 'active' | 'onboarding') =>
    update.mutate(
      { status: next },
      {
        // The bar is the server's. Whatever it says is what an owner reads.
        onError: (cause) => Alert.alert(t('manage.live.failed'), toApiError(cause).message),
      },
    );

  const confirmClose = () =>
    Alert.alert(t('manage.live.closeTitle'), t('manage.live.closeBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('manage.live.closeAction'),
        style: 'destructive',
        onPress: () => setStatus('onboarding'),
      },
    ]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t('manage.live.title')} />

      <ScrollView contentContainerClassName="gap-4 px-4 pb-10">
        <StatusCard status={status} />

        {status === 'suspended' ? (
          <Text variant="body" className="text-gray-500">
            {t('manage.live.suspendedBody')}
          </Text>
        ) : null}

        {status === 'onboarding' ? (
          <>
            <Text variant="body" className="text-gray-500">
              {t('manage.live.onboardingBody')}
            </Text>

            <Requirement
              met={blocker === null}
              // Unknown until the menu loads; claiming either way would be a guess.
              pending={!menuLoaded}
              label={t('manage.live.needDish')}
              hint={t('manage.live.needDishHint')}
              onPress={() => router.push('/manage/menu')}
            />
          </>
        ) : null}

        {shutLooking ? (
          <View className="flex-row items-start gap-2 rounded-2xl bg-warning-100 p-4">
            <Ionicons name="alert-circle-outline" size={16} color={colors.warning[700]} />
            <View className="flex-1 gap-1">
              <Text variant="caption" className="text-warning-700">
                {t('manage.live.noHoursWarning')}
              </Text>
              <Text
                variant="caption"
                className="font-semibold text-warning-700"
                onPress={() => router.push('/manage/hours')}
              >
                {t('manage.live.setHours')}
              </Text>
            </View>
          </View>
        ) : null}

        {canChangeStatus(status) ? (
          status === 'active' ? (
            <Button variant="secondary" onPress={confirmClose} disabled={update.isPending}>
              {update.isPending ? t('common.saving') : t('manage.live.closeAction')}
            </Button>
          ) : (
            <>
              <Button
                onPress={() => setStatus('active')}
                disabled={blocker !== null || !menuLoaded || update.isPending}
              >
                {update.isPending ? t('common.saving') : t('manage.live.openAction')}
              </Button>

              {blocker ? (
                <Text variant="caption" className="text-center text-gray-400">
                  {t('manage.live.blockedHint')}
                </Text>
              ) : null}
            </>
          )
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusCard({ status }: { status: Restaurant['status'] }) {
  const { t } = useTranslation();

  const look = {
    active: { tint: 'bg-success-500/10', colour: colors.success[500], icon: 'checkmark-circle' },
    onboarding: { tint: 'bg-gray-100', colour: colors.gray[500], icon: 'eye-off-outline' },
    suspended: { tint: 'bg-error-500/10', colour: colors.error[500], icon: 'ban-outline' },
  }[status];

  return (
    <View className={`flex-row items-center gap-3 rounded-2xl p-4 ${look.tint}`}>
      <Ionicons name={look.icon as 'checkmark-circle'} size={22} color={look.colour} />
      <View className="flex-1">
        <Text variant="bodyMedium" className="text-gray-900">
          {t(`manage.live.state.${status}`)}
        </Text>
        <Text variant="caption" className="mt-0.5 text-gray-600">
          {t(`manage.live.stateHint.${status}`)}
        </Text>
      </View>
    </View>
  );
}

type RequirementProps = {
  met: boolean;
  pending: boolean;
  label: string;
  hint: string;
  onPress: () => void;
};

function Requirement({ met, pending, label, hint, onPress }: RequirementProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-start gap-3 rounded-2xl border border-gray-200 p-4">
      <Ionicons
        name={pending ? 'ellipse-outline' : met ? 'checkmark-circle' : 'ellipse-outline'}
        size={20}
        color={met && !pending ? colors.success[500] : colors.gray[300]}
      />
      <View className="flex-1 gap-1">
        <Text variant="bodyMedium" className="text-gray-900">
          {label}
        </Text>
        <Text variant="caption" className="text-gray-500">
          {hint}
        </Text>
        {!met && !pending ? (
          <Text variant="caption" className="font-semibold text-primary-600" onPress={onPress}>
            {t('manage.live.goToMenu')}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
