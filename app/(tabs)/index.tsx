import { View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text variant="subheading" className="text-gray-900">
          Foodio
        </Text>
        <Text variant="body" className="mt-2 text-gray-500">
          Main app goes here
        </Text>
      </View>
    </SafeAreaView>
  );
}
