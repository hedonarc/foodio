import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

        <Text className="mt-8 text-center font-bold text-3xl text-gray-900">{title}</Text>

        <Text className="mt-4 text-center text-base leading-6 text-gray-500">{description}</Text>
      </View>

      <View className="gap-4 px-8 pb-12">
        <View className="rounded-2xl bg-primary p-4">
          <Text
            className="text-center font-semibold text-base text-white"
            accessibilityRole="button"
            onPress={onAllow}
          >
            Allow
          </Text>
        </View>

        <Text
          className="text-center text-base text-gray-400"
          accessibilityRole="button"
          onPress={onSkip}
        >
          Skip
        </Text>
      </View>
    </SafeAreaView>
  );
}
