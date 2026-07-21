import { Pressable, Text } from 'react-native';

import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type LinkProps = {
  children: string;
  onPress: () => void;
  icon?: ReactNode;
  className?: string;
};

export function Link({ children, onPress, icon, className }: LinkProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={cn('items-center justify-center py-2', className)}
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
