import { Pressable, Switch, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';
import { formatTimeOfDay, formatWeekday } from '@/utils/openingHours';

import type { Window } from '../lib/week';
import { isOvernight, MAX_SHIFTS } from '../lib/week';

type DayHoursCardProps = {
  day: number;
  shifts: readonly Window[];
  onToggleOpen: (open: boolean) => void;
  onEditTime: (index: number, field: 'opensAt' | 'closesAt') => void;
  onAddShift: () => void;
  onRemoveShift: (index: number) => void;
};

/** One day, its windows, and the switch that closes it. */
export function DayHoursCard({
  day,
  shifts,
  onToggleOpen,
  onEditTime,
  onAddShift,
  onRemoveShift,
}: DayHoursCardProps) {
  const { t, i18n } = useTranslation();
  const name = formatWeekday(day, i18n.language);
  const isOpen = shifts.length > 0;

  return (
    <View className="border-b border-gray-100 px-4 py-3">
      <View className="flex-row items-center">
        <Text
          variant="bodyMedium"
          className={isOpen ? 'flex-1 text-gray-900' : 'flex-1 text-gray-400'}
        >
          {name}
        </Text>

        {isOpen && shifts.length < MAX_SHIFTS ? (
          <Pressable
            onPress={onAddShift}
            accessibilityRole="button"
            accessibilityLabel={t('manage.hours.addShift', { day: name })}
            className="mr-3 flex-row items-center gap-1 py-1"
          >
            <Ionicons name="add" size={14} color={colors.primary[600]} />
            <Text variant="label" className="text-primary-600">
              {t('manage.hours.addShift', { day: '' }).trim()}
            </Text>
          </Pressable>
        ) : null}

        <Switch
          value={isOpen}
          onValueChange={onToggleOpen}
          accessibilityLabel={t('manage.hours.openOn', { day: name })}
          trackColor={{ true: colors.primary[500], false: colors.gray[300] }}
        />
      </View>

      {!isOpen ? (
        <Text variant="caption" className="mt-1 text-gray-400">
          {t('manage.hours.closed')}
        </Text>
      ) : null}

      {shifts.map((shift, index) => (
        <View key={index} className="mt-2 flex-row items-center gap-2">
          <TimeChip
            label={t('manage.hours.opensAt')}
            value={formatTimeOfDay(shift.opensAt, i18n.language)}
            onPress={() => onEditTime(index, 'opensAt')}
          />

          <Ionicons name="arrow-forward" size={14} color={colors.gray[300]} />

          <TimeChip
            label={t('manage.hours.closesAt')}
            value={formatTimeOfDay(shift.closesAt, i18n.language)}
            onPress={() => onEditTime(index, 'closesAt')}
          />

          {isOvernight(shift) ? (
            <Text variant="caption" className="text-warning-700">
              {t('manage.hours.nextDay', {
                day: formatWeekday((day + 1) % 7, i18n.language),
              })}
            </Text>
          ) : null}

          <View className="flex-1" />

          {shifts.length > 1 ? (
            <Pressable
              onPress={() => onRemoveShift(index)}
              accessibilityRole="button"
              accessibilityLabel={t('manage.hours.removeShift')}
              className="p-1.5"
            >
              <Ionicons name="close" size={16} color={colors.gray[400]} />
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

type TimeChipProps = { label: string; value: string; onPress: () => void };

function TimeChip({ label, value, onPress }: TimeChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}`}
      className="flex-row items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 active:bg-gray-50"
    >
      <Text variant="bodyMedium" className="text-gray-900">
        {value}
      </Text>
      <Ionicons name="chevron-down" size={13} color={colors.gray[400]} />
    </Pressable>
  );
}
