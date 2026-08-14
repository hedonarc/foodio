import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import type { ComponentProps } from 'react';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

type ManageSectionRowProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  /** What this section is for, in the owner's terms rather than the schema's. */
  subtitle: string;
  onPress: () => void;
};

export function ManageSectionRow({ icon, title, subtitle, onPress }: ManageSectionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-4 active:bg-gray-50"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-50">
        <Ionicons name={icon} size={18} color={colors.primary[600]} />
      </View>

      <View className="flex-1">
        <Text variant="bodyMedium" className="text-gray-900">
          {title}
        </Text>
        <Text variant="caption" className="mt-0.5 text-gray-500">
          {subtitle}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.gray[300]} />
    </Pressable>
  );
}
