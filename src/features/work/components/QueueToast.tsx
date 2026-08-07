import { View } from 'react-native';

import { Text } from '@/components/ui';

/** A transient banner — the queue underneath already shows the true state. */
export function QueueToast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute bottom-6 left-4 right-4 rounded-2xl bg-gray-900 px-4 py-3"
    >
      <Text variant="label" className="text-white">
        {message}
      </Text>
    </View>
  );
}
