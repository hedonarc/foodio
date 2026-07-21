import { View } from 'react-native';

import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Link, Text } from '@/components/ui';

export type PermissionScreenProps = {
  illustration: ReactNode;
  title: string;
  description: string;
  onAllow: () => void;
  onSkip: () => void;
};

export function PermissionScreen({
  illustration,
  title,
  description,
  onAllow,
  onSkip,
}: PermissionScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        {illustration}

        <Text variant="heading" className="mt-8 text-center text-gray-900">
          {title}
        </Text>

        <Text variant="body" className="mt-4 text-center text-gray-500">
          {description}
        </Text>
      </View>

      <View className="gap-4 px-8 pb-12">
        <Button onPress={onAllow}>Allow</Button>

        <Link onPress={onSkip}>Skip</Link>
      </View>
    </SafeAreaView>
  );
}
