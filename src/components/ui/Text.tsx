import { Text as RNText } from 'react-native';

import type { TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/cn';

type TextVariant = 'heading' | 'subheading' | 'body' | 'bodyMedium' | 'label' | 'caption';

type TextProps = RNTextProps & {
  variant?: TextVariant;
  className?: string;
};

const variantStyles: Record<TextVariant, string> = {
  heading: 'text-[30px] font-bold leading-9',
  subheading: 'text-[20px] font-bold leading-7',
  body: 'text-base leading-6',
  bodyMedium: 'text-base font-semibold leading-6',
  label: 'text-sm font-semibold leading-5',
  caption: 'text-xs leading-4',
};

export function Text({ variant = 'body', className, ...props }: TextProps) {
  return <RNText className={cn(variantStyles[variant], className)} {...props} />;
}
