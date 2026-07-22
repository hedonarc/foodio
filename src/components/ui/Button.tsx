import { Pressable, Text as RNText } from 'react-native';

import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'md' | 'lg';

type ButtonProps = {
  children: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 active:bg-primary-600',
  secondary: 'bg-gray-100 active:bg-gray-200',
  ghost: 'bg-transparent active:bg-gray-50',
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-gray-900',
  ghost: 'text-gray-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  md: 'py-3 px-6 rounded-2xl',
  lg: 'py-4 px-8 rounded-2xl',
};

const sizeTextStyles: Record<ButtonSize, string> = {
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  className,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={cn(
        'flex-row items-center justify-center',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50',
        className,
      )}
    >
      {icon}
      <RNText
        className={cn(
          'font-semibold text-center',
          variantTextStyles[variant],
          sizeTextStyles[size],
          icon ? 'ml-2' : '',
        )}
      >
        {children}
      </RNText>
    </Pressable>
  );
}
