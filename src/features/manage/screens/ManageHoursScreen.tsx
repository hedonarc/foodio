import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { ErrorState, LoadingState, ScreenHeader } from '@/components/shared';
import { Button, Text } from '@/components/ui';
import type { Restaurant } from '@/features/restaurants';
import { useRestaurant } from '@/features/restaurants';
import { useSessionStore } from '@/stores/session.store';
import { formatWeekday } from '@/utils/openingHours';

import { DayHoursCard } from '../components/DayHoursCard';
import { TimePickerSheet } from '../components/TimePickerSheet';
import { useReplaceOpeningHours } from '../hooks/useReplaceOpeningHours';
import type { Week } from '../lib/week';
import {
  ALL_DAY,
  DAYS,
  fromOpeningHours,
  optionsFor,
  problemsWith,
  toOpeningHours,
  withCurrent,
  withExtraShift,
} from '../lib/week';

export function ManageHoursScreen() {
  const router = useRouter();
  const role = useSessionStore((state) => state.role);
  const restaurantId = role.kind === 'kitchen' ? role.restaurantId : '';

  const { data: restaurant, isPending, error, refetch } = useRestaurant(restaurantId);

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

  return <HoursEditor key={restaurant.id} restaurant={restaurant} onSaved={() => router.back()} />;
}

/** Which control the sheet is currently editing. */
type Editing = { day: number; index: number; field: 'opensAt' | 'closesAt' };

function HoursEditor({ restaurant, onSaved }: { restaurant: Restaurant; onSaved: () => void }) {
  const { t, i18n } = useTranslation();
  const save = useReplaceOpeningHours(restaurant.id);

  const [week, setWeek] = useState<Week>(() => fromOpeningHours(restaurant.openingHours));
  const [editing, setEditing] = useState<Editing | null>(null);
  const [dirty, setDirty] = useState(false);

  const update = (day: number, shifts: Week[number]) => {
    setWeek((current) => ({ ...current, [day]: shifts }));
    setDirty(true);
  };

  const problems = problemsWith(week, (day) => formatWeekday(day, i18n.language));
  const editingShifts = editing ? (week[editing.day] ?? []) : [];
  const editingValue = editing ? (editingShifts[editing.index]?.[editing.field] ?? '') : '';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t('manage.hours.title')} />

      <ScrollView contentContainerClassName="pb-10">
        <View className="px-4 pb-2">
          <Text variant="caption" className="text-gray-500">
            {t('manage.hours.subtitle')}
          </Text>
        </View>

        {DAYS.map((day) => (
          <DayHoursCard
            key={day}
            day={day}
            shifts={week[day] ?? []}
            // Closing a day drops its windows; opening one starts from a normal
            // trading day rather than an empty row nobody can save.
            onToggleOpen={(open) => update(day, open ? [{ ...ALL_DAY }] : [])}
            onEditTime={(index, field) => setEditing({ day, index, field })}
            onAddShift={() => update(day, withExtraShift(week[day] ?? []))}
            onRemoveShift={(index) =>
              update(
                day,
                (week[day] ?? []).filter((_, position) => position !== index),
              )
            }
          />
        ))}

        <View className="gap-3 px-4 pt-4">
          {problems.length > 0 ? (
            <View className="gap-1 rounded-2xl border border-error-500 bg-error-500/5 p-3">
              {problems.map((problem) => (
                <Text key={problem} variant="caption" className="text-error-500">
                  {problem}
                </Text>
              ))}
            </View>
          ) : null}

          {save.error ? (
            <Text variant="caption" className="text-error-500" accessibilityLiveRegion="polite">
              {toApiError(save.error).message}
            </Text>
          ) : null}

          <Button
            onPress={() => save.mutate(toOpeningHours(week), { onSuccess: onSaved })}
            disabled={!dirty || problems.length > 0 || save.isPending}
          >
            {save.isPending ? t('common.saving') : t('common.save')}
          </Button>

          <Text variant="caption" className="text-center text-gray-400">
            {t('manage.hours.timezone', { zone: restaurant.timezone })}
          </Text>
        </View>
      </ScrollView>

      <TimePickerSheet
        visible={editing !== null}
        title={t(editing?.field === 'closesAt' ? 'manage.hours.closesAt' : 'manage.hours.opensAt')}
        options={
          editing
            ? withCurrent(optionsFor(editingShifts, editing.index, editing.field), editingValue)
            : []
        }
        value={editingValue}
        onClose={() => setEditing(null)}
        onSelect={(time) => {
          if (!editing) return;
          update(
            editing.day,
            editingShifts.map((shift, position) =>
              position === editing.index ? { ...shift, [editing.field]: time } : shift,
            ),
          );
          setEditing(null);
        }}
      />
    </SafeAreaView>
  );
}
