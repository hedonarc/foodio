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
 * Pressed feedback belongs on the Pressable, never on the Text inside it.
 *
 * NativeWind implements `active:` by attaching press handlers to the element
 * carrying the variant. On a child Text that makes the text itself a touch
 * responder, so it swallows the press and the parent Pressable never fires —
 * tapping the padding worked, tapping the letters did nothing.
 *
 * `min-h-11` keeps the target at the 44pt minimum Apple's Human Interface
 * Guidelines ask for; `py-2` alone left roughly 36pt.
 */
export function Link({ children, onPress, icon, className }: LinkProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={8}
      className={cn('min-h-11 items-center justify-center py-2 active:opacity-60', className)}
    >
      {icon}
      <Text className={cn('text-base text-center text-gray-400', icon ? 'ml-2' : '')}>
        {children}
      </Text>
    </Pressable>
  );
}
