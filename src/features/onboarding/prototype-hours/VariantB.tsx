/** PROTOTYPE — throwaway. Variant B: set one pattern, then mark exceptions. */
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';

import type { Week, Window } from './shared';
import { dayName, DAYS, emptyWeek, shortDay, splitWeek, typicalWeek } from './shared';

const PATTERNS: { key: string; label: string; hint: string; build: () => Week }[] = [
  { key: 'all-day', label: 'Same every day', hint: '11:00 – 23:00', build: typicalWeek },
  { key: 'split', label: 'Lunch and dinner', hint: '12–15 and 19–23:30', build: splitWeek },
  { key: 'closed', label: 'Closed for now', hint: 'No hours set', build: emptyWeek },
];

const describe = (windows: Window[] | undefined): string =>
  !windows || windows.length === 0
    ? 'Closed'
    : windows.map((w) => `${w.opensAt}–${w.closesAt}`).join(', ');

/**
 * Most restaurants keep one pattern and break it on one or two days. So set the
 * pattern once, then override only what differs — seven near-identical rows of
 * typing is the thing this avoids.
 */
export function VariantB() {
  const [pattern, setPattern] = useState('all-day');
  const [week, setWeek] = useState<Week>(typicalWeek);
  const [closedDays, setClosedDays] = useState<number[]>([]);

  const apply = (key: string) => {
    const found = PATTERNS.find((p) => p.key === key);
    if (!found) return;
    setPattern(key);
    setWeek(found.build());
    setClosedDays([]);
  };

  const toggleClosed = (day: number) =>
    setClosedDays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
    );

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="gap-5 px-4 pb-10 pt-4">
      <View className="gap-1">
        <Text variant="subheading" className="text-gray-900">
          When are you open?
        </Text>
        <Text variant="caption" className="text-gray-500">
          Pick the pattern that fits, then mark any day you are shut.
        </Text>
      </View>

      <View className="gap-2">
        {PATTERNS.map((p) => (
          <Pressable
            key={p.key}
            onPress={() => apply(p.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: pattern === p.key }}
            className={
              pattern === p.key
                ? 'rounded-2xl border-2 border-primary-500 bg-primary-50 p-4'
                : 'rounded-2xl border border-gray-200 p-4'
            }
          >
            <Text variant="bodyMedium" className="text-gray-900">
              {p.label}
            </Text>
            <Text variant="caption" className="text-gray-500">
              {p.hint}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="gap-2">
        <Text variant="bodyMedium" className="text-gray-900">
          Closed on
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {DAYS.map((day) => (
            <Pressable
              key={day}
              onPress={() => toggleClosed(day)}
              accessibilityRole="button"
              accessibilityState={{ selected: closedDays.includes(day) }}
              className={
                closedDays.includes(day)
                  ? 'rounded-full bg-gray-900 px-3 py-2'
                  : 'rounded-full bg-gray-100 px-3 py-2'
              }
            >
              <Text
                variant="label"
                className={closedDays.includes(day) ? 'text-white' : 'text-gray-700'}
              >
                {shortDay(day)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="gap-1 rounded-2xl bg-gray-50 p-4">
        <Text variant="label" className="mb-1 text-gray-500">
          Your week
        </Text>
        {DAYS.map((day) => (
          <View key={day} className="flex-row justify-between py-0.5">
            <Text variant="caption" className="text-gray-700">
              {dayName(day)}
            </Text>
            <Text
              variant="caption"
              className={closedDays.includes(day) ? 'text-gray-400' : 'text-gray-900'}
            >
              {closedDays.includes(day) ? 'Closed' : describe(week[day])}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
