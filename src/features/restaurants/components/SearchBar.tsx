import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';

export function SearchBar() {
  const { t } = useTranslation();

  return (
    <View className="my-3 flex-row items-center rounded-2xl bg-gray-100 px-4 py-3 border border-gray-200/50">
      <Ionicons name="search-outline" size={20} color="#6B7280" />
      <Text variant="body" className="ml-3 text-gray-400 font-normal">
        {t('home.searchPlaceholder')}
      </Text>
    </View>
  );
}
