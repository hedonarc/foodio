import { View } from 'react-native';

import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return <View className={cn('rounded-2xl bg-white p-4 shadow-sm', className)}>{children}</View>;
}
