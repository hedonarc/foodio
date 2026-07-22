import { View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text variant="subheading" className="text-gray-900">
          {t('home.title')}
        </Text>
        <Text variant="body" className="mt-2 text-gray-500">
          {t('home.subtitle')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
