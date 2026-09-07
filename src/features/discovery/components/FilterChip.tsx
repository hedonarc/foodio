import { Pressable } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { colors } from '@/theme';

type FilterChipProps = {
  label: string;
  on?: boolean;
  /** An emoji, for a cuisine. */
  leading?: string;
  /** Shows a cross: the chip removes something rather than toggling it. */
  removable?: boolean;
  accessibilityLabel?: string;
  onPress: () => void;
};

export function FilterChip({
  label,
  on = false,
  leading,
  removable = false,
  accessibilityLabel,
  onPress,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={accessibilityLabel ?? label}
      className={cn(
        'mr-2 flex-row items-center rounded-full border px-3.5 py-2',
        on ? 'border-primary-500 bg-primary-500' : 'border-gray-200 bg-white active:bg-gray-50',
      )}
    >
      {leading ? <Text className="mr-1.5 text-sm">{leading}</Text> : null}
      <Text variant="label" className={on ? 'text-white' : 'text-gray-800'}>
        {label}
      </Text>
      {removable ? (
        <Ionicons
          name="close"
          size={14}
          color={on ? colors.white : colors.gray[500]}
          style={{ marginLeft: 6 }}
        />
      ) : null}
    </Pressable>
  );
}
