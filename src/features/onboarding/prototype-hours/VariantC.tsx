/** PROTOTYPE — throwaway. Variant C: edit one day at a time, see the customer's view. */
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { groupOpeningHours } from '@/utils/openingHours';

import type { Week } from './shared';
import {
  dayName,
  DAYS,
  isOvernight,
  problemsWith,
  shortDay,
  splitWeek,
  toOpeningHours,
} from './shared';

const TIMES = ['00:00', '08:00', '11:00', '12:00', '15:00', '18:00', '19:00', '22:00', '23:30'];

/**
 * One day at a time, with the customer-facing summary underneath — because the
 * question "did I say what I meant?" is answered by what a customer will read,
 * not by the form.
 *
 * Which is how this variant exposes a real bug: `groupOpeningHours` keys a Map
 * by `dayOfWeek`, so a second window on a day silently overwrites the first.
 * Load the split-shift week and the summary drops every lunch service, while
 * `isOpenAt` still opens for them. Defaults to a split week so this is visible
 * on first render rather than hidden behind a tap.
 */
export function VariantC() {
  const [week, setWeek] = useState<Week>(splitWeek);
  const [selected, setSelected] = useState<number>(1);

  const windows = week[selected] ?? [];
  const problems = problemsWith(week);
  const summary = groupOpeningHours(toOpeningHours(week));

  const cycle = (index: number, field: 'opensAt' | 'closesAt') => {
    const next = [...windows];
    const window = next[index];
    if (!window) return;
    const at = TIMES.indexOf(window[field]);
    next[index] = { ...window, [field]: TIMES[(at + 1) % TIMES.length] ?? '00:00' };
    setWeek((w) => ({ ...w, [selected]: next }));
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="gap-4 px-4 pb-10 pt-4">
      <View className="flex-row flex-wrap gap-2">
        {DAYS.map((day) => (
          <Pressable
            key={day}
            onPress={() => setSelected(day)}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === day }}
            className={
              selected === day
                ? 'rounded-full bg-primary-500 px-3 py-2'
                : 'rounded-full bg-gray-100 px-3 py-2'
            }
          >
            <Text variant="label" className={selected === day ? 'text-white' : 'text-gray-700'}>
              {shortDay(day)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="gap-2">
        <Text variant="subheading" className="text-gray-900">
          {dayName(selected)}
        </Text>

        {windows.map((window, index) => (
          <View key={index} className="flex-row items-center gap-2">
            <Pressable
              onPress={() => cycle(index, 'opensAt')}
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
              onPress={() => cycle(index, 'closesAt')}
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
          </View>
        ))}

        {windows.length === 0 ? (
          <Text variant="caption" className="text-gray-400">
            Closed all day.
          </Text>
        ) : null}
      </View>

      {problems.length > 0 ? (
        <View className="gap-1 rounded-2xl bg-error-50 p-3">
          {problems.map((p) => (
            <Text key={p} variant="caption" className="text-error-500">
              {p}
            </Text>
          ))}
        </View>
      ) : null}

      <View className="gap-1 rounded-2xl bg-gray-50 p-4">
        <Text variant="label" className="mb-1 text-gray-500">
          What a customer sees
        </Text>
        {summary.map((group, index) => (
          <View key={index} className="flex-row justify-between py-0.5">
            <Text variant="caption" className="text-gray-700">
              {group.days.map(shortDay).join(', ')}
            </Text>
            <Text variant="caption" className="text-gray-900">
              {group.opensAt}–{group.closesAt}
            </Text>
          </View>
        ))}
        {summary.length === 0 ? (
          <Text variant="caption" className="text-gray-400">
            Closed all week — customers will see this restaurant as shut.
          </Text>
        ) : null}
      </View>

      <View className="rounded-2xl border border-warning-500 bg-warning-100 p-3">
        <Text variant="caption" className="text-warning-700">
          Prototype note: the summary above is the app&apos;s real `groupOpeningHours`. With the
          split week loaded it shows one window a day — every lunch service is missing, because that
          function keys a Map by day and the second window overwrites the first. `isOpenAt` opens
          for lunch regardless, so today the app would take orders while telling customers it is
          shut.
        </Text>
      </View>
    </ScrollView>
  );
}
