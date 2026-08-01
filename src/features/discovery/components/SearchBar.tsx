import { Pressable, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { colors } from '@/theme';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <View className="my-3 flex-row items-center rounded-2xl border border-gray-200/50 bg-gray-100 px-4 py-1">
      <Ionicons name="search-outline" size={20} color={colors.gray[500]} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={t('home.searchPlaceholder')}
        placeholderTextColor={colors.gray[400]}
        accessibilityLabel={t('home.searchLabel')}
        autoCorrect={false}
        returnKeyType="search"
        className="ml-3 flex-1 py-2 text-base text-gray-900"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel={t('home.clearSearch')}
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={18} color={colors.gray[400]} />
        </Pressable>
      ) : null}
    </View>
  );
}
