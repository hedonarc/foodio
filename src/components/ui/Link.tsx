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
 * Keep `active:` on the Pressable, never on the Text — NativeWind makes the
 * element carrying it a touch responder, and a Text that is one eats the press.
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
