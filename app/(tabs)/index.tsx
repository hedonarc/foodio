import { Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-900">Foodio</Text>
        <Text className="mt-2 text-gray-500">Main app goes here</Text>
      </View>
    </SafeAreaView>
  );
}
