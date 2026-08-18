import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ScreenHeader } from '@/components/shared';
import { Text } from '@/components/ui';
import { useRestaurants } from '@/features/restaurants';
import { useSessionStore } from '@/stores/session.store';

import { ManageSectionRow } from '../components/ManageSectionRow';

/**
 * Everything a restaurant sets about itself, one screen deep from the kitchen.
 *
 * A hub rather than a third tab: the tab bar is the control touched mid-service
 * on a shared tablet, and both its entries are service-critical. Parking "edit
 * your profile" one mistap from "accept this order" would be a permanent cost
 * for a surface used perhaps weekly. See t4.
 *
 * Phone-first, unlike the rest of `app/(kitchen)`, which assumes a propped-up
 * tablet — an owner sets hours and a roster at home, not over a hot pass.
 */
export function ManageHubScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const role = useSessionStore((state) => state.role);
  const restaurantId = role.kind === 'kitchen' ? role.restaurantId : undefined;

  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.find((entry) => entry.id === restaurantId);

  if (!restaurantId) {
    // Reachable by deep link, or by switching role with this screen open.
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-white">
        <ScreenHeader title={t('manage.title')} />
        <EmptyState
          message={t('manage.kitchenOnly')}
          className="flex-1 items-center justify-center px-8"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t('manage.title')} />

      <ScrollView contentContainerClassName="pb-10">
        <View className="px-4 pb-4">
          <Text variant="caption" className="text-gray-500">
            {t('manage.subtitle', { name: restaurant?.name ?? '' })}
          </Text>
        </View>

        <ManageSectionRow
          icon="storefront-outline"
          title={t('manage.profile.title')}
          subtitle={t('manage.profile.subtitle')}
          onPress={() => router.push('/manage/profile')}
        />

        <ManageSectionRow
          icon="time-outline"
          title={t('manage.hours.title')}
          subtitle={t('manage.hours.subtitle')}
          onPress={() => router.push('/manage/hours')}
        />

        <ManageSectionRow
          icon="people-outline"
          title={t('manage.staff.title')}
          subtitle={t('manage.staff.subtitle')}
          onPress={() => router.push('/manage/staff')}
        />

        <ManageSectionRow
          icon="list-outline"
          title={t('manage.menu.title')}
          subtitle={t('manage.menu.subtitle')}
          onPress={() => router.push('/manage/menu')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
