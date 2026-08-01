import { Pressable, Text } from 'react-native';

import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type LinkProps = {
  children: string;
  onPress: () => void;
  icon?: ReactNode;
  className?: string;
};

/**
 * `py-2` around a 20pt line leaves a ~36pt target, under the 44pt minimum
 * Apple's Human Interface Guidelines ask for. `min-h-11` (44pt) makes the
 * target itself big enough rather than relying on hitSlop, so the size is
 * honest to anyone inspecting the layout.
 */
export function Link({ children, onPress, icon, className }: LinkProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={8}
      className={cn('min-h-11 items-center justify-center py-2', className)}
    >
      {icon}
      <Text
        className={cn(
          'text-base text-center text-gray-400 active:text-gray-600',
          icon ? 'ml-2' : '',
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}
