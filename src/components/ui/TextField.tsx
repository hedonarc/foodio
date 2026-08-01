import { TextInput, View } from 'react-native';

import type { TextInputProps } from 'react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/theme';

import { Text } from './Text';

type TextFieldProps = Omit<TextInputProps, 'className'> & {
  label: string;
  // `| undefined` because the project runs exactOptionalPropertyTypes.
  error?: string | undefined;
  className?: string | undefined;
};

export function TextField({ label, error, className, ...props }: TextFieldProps) {
  return (
    <View className={cn('gap-1.5', className)}>
      <Text variant="label" className="text-gray-700">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.gray[400]}
        className={cn(
          'rounded-xl border bg-white px-4 py-3 text-base text-gray-900',
          error ? 'border-error-500' : 'border-gray-200',
        )}
        {...props}
      />
      {error ? (
        <Text variant="caption" className="text-error-500" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
