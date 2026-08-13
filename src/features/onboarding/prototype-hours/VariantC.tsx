/** PROTOTYPE — throwaway. Variant C: pick days, set times, see the customer's view. */
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { colors } from '@/theme';
import { groupOpeningHours } from '@/utils/openingHours';

import type { Week, Window } from './shared';
import {
  dayName,
  DAYS,
  emptyWeek,
  isOvernight,
  problemsWith,
  shortDay,
  toOpeningHours,
} from './shared';

const TIMES = [
  '00:00',
  '01:00',
  '08:00',
  '09:00',
  '11:00',
  '12:00',
  '15:00',
  '16:00',
  '18:00',
  '19:00',
  '22:00',
  '23:00',
  '23:30',
];

/** The backend allows three windows a day; this variant offers two — lunch and dinner. */
const MAX_SHIFTS = 2;

const ALL_DAY: Window = { opensAt: '11:00', closesAt: '23:00' };
const LUNCH: Window = { opensAt: '12:00', closesAt: '15:00' };
const DINNER: Window = { opensAt: '19:00', closesAt: '23:30' };

/**
 * Each end of a shift is penned in by its neighbours, so windows cannot be made
 * to cross at all — the overlap is unrepresentable rather than merely warned
 * about. A shift with another after it also cannot run past midnight, which is
 * why only the last one closes unbounded.
 *
 * Every bound is derived from a value the current week already satisfies, so
 * the list always contains at least what the pill is showing: no dead ends, and
 * no need to move two controls in lockstep.
 */
function optionsFor(shifts: readonly Window[], index: number, field: 'opensAt' | 'closesAt') {
  const shift = shifts[index];
  if (!shift) return TIMES;

  const previous = shifts[index - 1];
  const next = shifts[index + 1];

  const after = field === 'opensAt' ? previous?.closesAt : next && shift.opensAt;
  const before = field === 'opensAt' ? next && shift.closesAt : next?.opensAt;

  return TIMES.filter(
    (time) => (after === undefined || time > after) && (before === undefined || time < before),
  );
}

/**
 * "5 of 7 open" makes the owner do the subtraction. Name the exception instead,
 * and name whichever list is shorter — the point is to spot a day set wrong.
 */
function summarise(open: readonly number[], closed: readonly number[]): string {
  if (open.length === 0) return 'Closed every day';
  if (closed.length === 0) return 'Open every day';
  return closed.length <= open.length
    ? `Closed ${closed.map(shortDay).join(', ')}`
    : `Open ${open.map(shortDay).join(', ')}`;
}

const to12Hour = (hhmm: string): string => {
  const [hours = '0', minutes = '00'] = hhmm.split(':');
  const hour = Number(hours);
  return `${hour % 12 === 0 ? 12 : hour % 12}:${minutes} ${hour < 12 ? 'am' : 'pm'}`;
};

/**
 * A bare "next day" leaves the owner working out which day and how late. Name
 * both — except under "same times every day", where there is no one day to name.
 */
const overnightLabel = (day: number, closesAt: string, sameEveryDay: boolean): string =>
  `${sameEveryDay ? 'next day' : shortDay((day + 1) % 7)}, ${to12Hour(closesAt)}`;

/** One shift, so "Add another shift" is visible rather than capped out on arrival. */
const seedShifts = (): Window[] => [{ ...ALL_DAY }];

/**
 * Days first, then times. Selecting a day is what makes it a working day —
 * anything left unselected is closed, which is exactly how the API stores it
 * (no row for that day). "Same times every day" is checked by default because
 * that is the common case, and unchecking it fans the one schedule out into
 * seven editable ones rather than starting from blank.
 *
 * The customer summary underneath is the app's *real* `groupOpeningHours`, and
 * that is how this variant exposes a live bug: the function keys a Map by
 * `dayOfWeek`, so a second window on a day silently overwrites the first. Add a
 * second shift and lunch drops out of the panel.
 */
export function VariantC() {
  const [openDays, setOpenDays] = useState<number[]>([...DAYS]);
  const [sameEveryDay, setSameEveryDay] = useState(true);
  const [shared, setShared] = useState<Window[]>(seedShifts);
  const [perDay, setPerDay] = useState<Record<number, Window[]>>({});

  const shiftsFor = (day: number): Window[] =>
    sameEveryDay ? shared : (perDay[day] ?? seedShifts());

  const week: Week = DAYS.reduce<Week>((acc, day) => {
    acc[day] = openDays.includes(day) ? shiftsFor(day) : [];
    return acc;
  }, emptyWeek());

  const problems = problemsWith(week);
  const summary = groupOpeningHours(toOpeningHours(week));

  const toggleDay = (day: number) =>
    setOpenDays((days) => (days.includes(day) ? days.filter((d) => d !== day) : [...days, day]));

  /** Unchecking fans the shared schedule out, so nothing the owner typed is lost. */
  const setSame = (next: boolean) => {
    if (!next) {
      setPerDay(
        DAYS.reduce<Record<number, Window[]>>((acc, day) => {
          acc[day] = shared.map((w) => ({ ...w }));
          return acc;
        }, {}),
      );
    }
    setSameEveryDay(next);
  };

  const writeShifts = (day: number, shifts: Window[]) => {
    if (sameEveryDay) {
      setShared(shifts);
      return;
    }
    setPerDay((current) => ({ ...current, [day]: shifts }));
  };

  const cycle = (day: number, index: number, field: 'opensAt' | 'closesAt') => {
    const shifts = shiftsFor(day).map((w) => ({ ...w }));
    const shift = shifts[index];
    if (!shift) return;

    const options = optionsFor(shifts, index, field);
    if (options.length === 0) return;

    /** An out-of-range value indexes to -1, so the first step snaps it into range. */
    const at = options.indexOf(shift[field]);
    shifts[index] = { ...shift, [field]: options[(at + 1) % options.length] ?? '00:00' };
    writeShifts(day, shifts);
  };

  /**
   * A second shift means a break in the middle of the day, so the first one has
   * to give way — appending dinner to an all-day window would only overlap it.
   * A first shift that already starts in the evening leaves no room to clip, so
   * the day becomes a plain lunch-and-dinner pair instead.
   */
  const addShift = (day: number) => {
    const shifts = shiftsFor(day);
    if (shifts.length >= MAX_SHIFTS) return;

    const first = shifts[0];
    const room = first !== undefined && first.opensAt < LUNCH.closesAt;
    writeShifts(day, [room ? { ...first, closesAt: LUNCH.closesAt } : { ...LUNCH }, { ...DINNER }]);
  };

  const removeShift = (day: number, index: number) =>
    writeShifts(
      day,
      shiftsFor(day).filter((_, i) => i !== index),
    );

  const editors = sameEveryDay ? [DAYS[0]] : DAYS.filter((day) => openDays.includes(day));

  /** Toggling appends, so re-derive both lists in week order before naming them. */
  const closedDays = DAYS.filter((day) => !openDays.includes(day));
  const openInOrder = DAYS.filter((day) => openDays.includes(day));

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="gap-3 px-4 pb-16 pt-4">
      <View className="gap-1">
        <Text variant="heading" className="text-gray-900">
          Opening hours
        </Text>
        <Text variant="body" className="text-gray-500">
          Choose the days you trade, then set the times.
        </Text>
      </View>

      <View className="gap-3 rounded-2xl bg-white p-4">
        <View className="flex-row items-baseline justify-between">
          <Text variant="bodyMedium" className="text-gray-900">
            Working days
          </Text>
          <Text variant="caption" className="text-gray-400">
            {summarise(openInOrder, closedDays)}
          </Text>
        </View>

        <View className="flex-row gap-1.5">
          {DAYS.map((day) => {
            const open = openDays.includes(day);

            return (
              <Pressable
                key={day}
                onPress={() => toggleDay(day)}
                accessibilityRole="button"
                accessibilityLabel={`${dayName(day)}, ${open ? 'open' : 'closed'}`}
                accessibilityState={{ selected: open }}
                className={
                  open
                    ? 'flex-1 items-center rounded-xl bg-primary-500 py-2.5'
                    : 'flex-1 items-center rounded-xl border border-gray-200 bg-white py-2.5'
                }
              >
                <Text variant="label" className={open ? 'text-white' : 'text-gray-400'}>
                  {shortDay(day)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text variant="caption" className="text-gray-400">
          Unselected days are closed — customers will see them as shut.
        </Text>
      </View>

      {openDays.length === 0 ? (
        <View className="rounded-2xl bg-white p-4">
          <Text variant="body" className="text-gray-400">
            Pick at least one day to set times.
          </Text>
        </View>
      ) : (
        <View className="gap-3 rounded-2xl bg-white p-4">
          <Text variant="bodyMedium" className="text-gray-900">
            Set times
          </Text>

          <Pressable
            onPress={() => setSame(!sameEveryDay)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: sameEveryDay }}
            className="flex-row items-center gap-3 rounded-xl bg-gray-50 p-3"
          >
            <View
              className={
                sameEveryDay
                  ? 'h-5 w-5 items-center justify-center rounded-md bg-primary-500'
                  : 'h-5 w-5 rounded-md border border-gray-300 bg-white'
              }
            >
              {sameEveryDay ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
            </View>

            <View className="flex-1">
              <Text variant="label" className="text-gray-900">
                Same times every day
              </Text>
              <Text variant="caption" className="text-gray-500">
                {sameEveryDay
                  ? 'Set it once and it applies to every open day.'
                  : 'Each day is set on its own.'}
              </Text>
            </View>
          </Pressable>

          {editors.map((day) => {
            if (day === undefined) return null;
            const shifts = shiftsFor(day);

            return (
              <View key={day} className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text variant="label" className="text-gray-500">
                    {sameEveryDay ? 'Every open day' : dayName(day)}
                  </Text>

                  {shifts.length < MAX_SHIFTS ? (
                    <Pressable
                      onPress={() => addShift(day)}
                      accessibilityRole="button"
                      accessibilityLabel={`Add another shift${sameEveryDay ? '' : ` on ${dayName(day)}`}`}
                      className="flex-row items-center gap-1 py-1"
                    >
                      <Ionicons name="add" size={14} color={colors.primary[600]} />
                      <Text variant="label" className="text-primary-600">
                        Add another shift
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                {shifts.map((shift, index) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <TimePill
                      value={shift.opensAt}
                      onPress={() => cycle(day, index, 'opensAt')}
                      label="Opens"
                      disabled={optionsFor(shifts, index, 'opensAt').length === 0}
                    />

                    <Ionicons name="arrow-forward" size={14} color={colors.gray[300]} />

                    <TimePill
                      value={shift.closesAt}
                      onPress={() => cycle(day, index, 'closesAt')}
                      label="Closes"
                      disabled={optionsFor(shifts, index, 'closesAt').length === 0}
                    />

                    {isOvernight(shift) ? (
                      <Text variant="caption" className="text-warning-700">
                        {overnightLabel(day, shift.closesAt, sameEveryDay)}
                      </Text>
                    ) : null}

                    <View className="flex-1" />

                    {shifts.length > 1 ? (
                      <Pressable
                        onPress={() => removeShift(day, index)}
                        accessibilityRole="button"
                        accessibilityLabel="Remove this shift"
                        className="p-1.5"
                      >
                        <Ionicons name="close" size={16} color={colors.gray[400]} />
                      </Pressable>
                    ) : null}
                  </View>
                ))}

                {shifts.length === 0 ? (
                  <Text variant="caption" className="text-red-700">
                    No shifts — this day would read as closed.
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {problems.length > 0 ? (
        <View className="gap-1 rounded-2xl border border-red-500 bg-red-100 p-4">
          {problems.map((problem) => (
            <Text key={problem} variant="caption" className="text-red-700">
              {problem}
            </Text>
          ))}
        </View>
      ) : null}

      <View className="gap-2 rounded-2xl bg-gray-900 p-4">
        <Text variant="label" className="text-gray-400">
          What a customer sees
        </Text>

        {summary.map((group, index) => (
          <View key={index} className="flex-row justify-between">
            <Text variant="body" className="text-gray-300">
              {group.days.map(shortDay).join(', ')}
            </Text>
            <Text variant="bodyMedium" className="text-white">
              {group.opensAt} – {group.closesAt}
            </Text>
          </View>
        ))}

        {summary.length === 0 ? (
          <Text variant="body" className="text-gray-400">
            Closed all week — this restaurant will look shut to everyone.
          </Text>
        ) : null}
      </View>

      <View className="rounded-2xl border border-warning-500 bg-warning-100 p-4">
        <Text variant="label" className="mb-1 text-warning-700">
          Prototype note
        </Text>
        <Text variant="caption" className="text-warning-700">
          The panel above is the app&apos;s real `groupOpeningHours`. Tap &quot;Add another
          shift&quot; and watch lunch vanish from it: that function keys a Map by day, so the second
          window overwrites the first. `isOpenAt` opens for lunch regardless, so today the app takes
          orders while telling customers it is shut.
        </Text>
      </View>
    </ScrollView>
  );
}

type TimePillProps = {
  value: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function TimePill({ value, label, onPress, disabled = false }: TimePillProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${label} at ${value}`}
      accessibilityState={{ disabled }}
      className={
        disabled
          ? 'flex-row items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5'
          : 'flex-row items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5'
      }
    >
      <Text variant="bodyMedium" className={disabled ? 'text-gray-400' : 'text-gray-900'}>
        {value}
      </Text>
      {disabled ? null : <Ionicons name="chevron-down" size={13} color={colors.gray[400]} />}
    </Pressable>
  );
}
