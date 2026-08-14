import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { SheetContainer, Text } from '@/components/ui';
import { colors } from '@/theme';
import { formatTimeOfDay } from '@/utils/openingHours';

const ROW_HEIGHT = 48;

type TimePickerSheetProps = {
  visible: boolean;
  title: string;
  /** Only the times this control may legally take — see `optionsFor`. */
  options: readonly string[];
  value: string;
  onSelect: (time: string) => void;
  onClose: () => void;
};

/**
 * A list of the times this control may take, rather than the prototype's
 * tap-to-cycle — which t7 flagged as a placeholder. Cycling was fine for
 * judging a layout and miserable for actually setting 07:30.
 *
 * It shows only legal options, so an overlap cannot be chosen at all. The list
 * is the constraint made visible.
 */
export function TimePickerSheet({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: TimePickerSheetProps) {
  const { i18n } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);

  // Opens on the current value rather than at midnight, which would put every
  // realistic choice below the fold.
  useEffect(() => {
    if (!visible) return;
    const index = options.indexOf(value);
    if (index < 0) return;

    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, (index - 2) * ROW_HEIGHT), animated: false });
    }, 0);
    return () => clearTimeout(timer);
  }, [visible, options, value]);

  return (
    <SheetContainer visible={visible} onClose={onClose}>
      <Text variant="subheading" className="mb-3 text-gray-900">
        {title}
      </Text>

      <ScrollView ref={scrollRef} className="max-h-96" showsVerticalScrollIndicator={false}>
        {options.map((time) => {
          const selected = time === value;

          return (
            <Pressable
              key={time}
              onPress={() => onSelect(time)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={{ height: ROW_HEIGHT }}
              className="flex-row items-center justify-between rounded-xl px-3 active:bg-gray-100"
            >
              <Text
                variant={selected ? 'bodyMedium' : 'body'}
                className={selected ? 'text-primary-600' : 'text-gray-900'}
              >
                {formatTimeOfDay(time, i18n.language)}
              </Text>
              {selected ? (
                <Ionicons name="checkmark" size={18} color={colors.primary[600]} />
              ) : null}
            </Pressable>
          );
        })}

        {options.length === 0 ? (
          <View className="py-6">
            <Text variant="body" className="text-center text-gray-400">
              {/* Unreachable by construction; said plainly rather than shown blank. */}
              No times are available here.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SheetContainer>
  );
}
