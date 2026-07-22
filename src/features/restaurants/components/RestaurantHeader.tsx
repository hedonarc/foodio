import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';

type RestaurantHeaderProps = {
  name: string;
};

export function RestaurantHeader({ name }: RestaurantHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center px-4 py-3">
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
      >
        <Ionicons name="chevron-back" size={20} color="#111827" />
      </Pressable>
      <Text variant="subheading" className="flex-1 text-gray-900" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}
