/** PROTOTYPE — throwaway. Variant A: the week as seven rows, edited in place. */
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

import type { Week } from './shared';
import { dayName, DAYS, isOvernight, MAX_PER_DAY, typicalWeek } from './shared';

const TIMES = ['00:00', '08:00', '11:00', '12:00', '15:00', '18:00', '19:00', '22:00', '23:30'];

/**
 * The literal shape of the data: seven days, each a list of windows. Closed is
 * simply an empty list, so there is no separate toggle to keep in sync — the
 * absence *is* the state, exactly as the API stores it.
 */
export function VariantA() {
  const [week, setWeek] = useState<Week>(typicalWeek);

  const edit = (day: number, next: Week[number]) => setWeek((w) => ({ ...w, [day]: next }));

  const cycle = (day: number, index: number, field: 'opensAt' | 'closesAt') => {
    const windows = [...(week[day] ?? [])];
    const window = windows[index];
    if (!window) return;
    const at = TIMES.indexOf(window[field]);
    windows[index] = { ...window, [field]: TIMES[(at + 1) % TIMES.length] ?? TIMES[0] ?? '00:00' };
    edit(day, windows);
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-4 pb-10 pt-4">
      <Text variant="subheading" className="text-gray-900">
        Opening hours
      </Text>
      <Text variant="caption" className="mb-3 text-gray-500">
        Tap a time to change it. A day with no rows is closed.
      </Text>

      {DAYS.map((day) => {
        const windows = week[day] ?? [];

        return (
          <View key={day} className="border-b border-gray-100 py-3">
            <View className="flex-row items-center justify-between">
              <Text
                variant="bodyMedium"
                className={windows.length ? 'text-gray-900' : 'text-gray-400'}
              >
                {dayName(day)}
              </Text>

              {windows.length < MAX_PER_DAY ? (
                <Pressable
                  onPress={() => edit(day, [...windows, { opensAt: '19:00', closesAt: '23:00' }])}
                  accessibilityRole="button"
                  className="flex-row items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5"
                >
                  <Ionicons name="add" size={13} color={colors.gray[700]} />
                  <Text variant="caption" className="text-gray-700">
                    {windows.length === 0 ? 'Open this day' : 'Second shift'}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {windows.length === 0 ? (
              <Text variant="caption" className="mt-1 text-gray-400">
                Closed
              </Text>
            ) : null}

            {windows.map((window, index) => (
              <View key={index} className="mt-2 flex-row items-center gap-2">
                <Pressable
                  onPress={() => cycle(day, index, 'opensAt')}
                  accessibilityRole="button"
                  className="rounded-lg bg-gray-100 px-3 py-2"
                >
                  <Text variant="label" className="text-gray-900">
                    {window.opensAt}
                  </Text>
                </Pressable>

                <Text variant="caption" className="text-gray-400">
                  to
                </Text>

                <Pressable
                  onPress={() => cycle(day, index, 'closesAt')}
                  accessibilityRole="button"
                  className="rounded-lg bg-gray-100 px-3 py-2"
                >
                  <Text variant="label" className="text-gray-900">
                    {window.closesAt}
                  </Text>
                </Pressable>

                {isOvernight(window) ? (
                  <Text variant="caption" className="text-warning-700">
                    next day
                  </Text>
                ) : null}

                <View className="flex-1" />

                <Pressable
                  onPress={() =>
                    edit(
                      day,
                      windows.filter((_, i) => i !== index),
                    )
                  }
                  accessibilityRole="button"
                  className="p-1"
                >
                  <Ionicons name="close" size={16} color={colors.gray[400]} />
                </Pressable>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}
