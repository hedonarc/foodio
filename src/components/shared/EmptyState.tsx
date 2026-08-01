import { View } from 'react-native';

import { Text } from '@/components/ui';

type EmptyStateProps = {
  message: string;
  className?: string;
};

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <View className={className ?? 'items-center justify-center px-8 py-10'}>
      <Text variant="body" className="text-center text-gray-400">
        {message}
      </Text>
    </View>
  );
}
