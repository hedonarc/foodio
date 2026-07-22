import { View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';

export default function RestaurantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <Text variant="heading" className="text-gray-900 text-center">
          {t('restaurant.detailsTitle')}
        </Text>
        <Text variant="body" className="mt-4 text-gray-500 text-center">
          {t('restaurant.idLabel')}
        </Text>
        <Text variant="subheading" className="mt-1 text-primary-600 font-mono">
          {id}
        </Text>
      </View>
    </SafeAreaView>
  );
}
