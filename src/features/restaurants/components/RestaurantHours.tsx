import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';
import type { OpeningHours } from '@/utils/openingHours';
import { formatTimeOfDay, formatWeekday, groupOpeningHours } from '@/utils/openingHours';

type RestaurantHoursProps = {
  openingHours: OpeningHours[];
};

export function RestaurantHours({ openingHours }: RestaurantHoursProps) {
  const { t, i18n } = useTranslation();

  const groups = groupOpeningHours(openingHours);
  if (groups.length === 0) return null;

  return (
    <View className="mx-4 my-4 rounded-2xl bg-gray-50 p-4">
      <View className="mb-3 flex-row items-center">
        <Ionicons name="time-outline" size={16} color={colors.gray[500]} />
        <Text variant="bodyMedium" className="ml-2 text-gray-900">
          {t('restaurant.hours')}
        </Text>
      </View>
      {groups.map((group) => {
        const first = group.days[0];
        const last = group.days[group.days.length - 1];
        if (first === undefined || last === undefined) return null;

        const label =
          group.days.length === 1
            ? formatWeekday(first, i18n.language)
            : `${formatWeekday(first, i18n.language)} – ${formatWeekday(last, i18n.language)}`;

        return (
          <View key={`${first}-${last}`} className="mb-1.5 flex-row justify-between">
            <Text variant="caption" className="text-gray-600 font-medium">
              {label}
            </Text>
            <Text variant="caption" className="text-gray-500">
              {formatTimeOfDay(group.opensAt, i18n.language)} –{' '}
              {formatTimeOfDay(group.closesAt, i18n.language)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
