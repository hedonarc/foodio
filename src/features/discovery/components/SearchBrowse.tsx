import { Pressable, ScrollView, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

import type { Category } from '../lib/categories';

import { FilterChip } from './FilterChip';

type SearchBrowseProps = {
  recents: readonly string[];
  categories: readonly Category[];
  onRecent: (term: string) => void;
  onCuisine: (name: string) => void;
};

/** What the screen shows before anyone has asked it anything. */
export function SearchBrowse({ recents, categories, onRecent, onCuisine }: SearchBrowseProps) {
  const { t } = useTranslation();

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-3 pb-8">
      {recents.length > 0 ? (
        <>
          <Text variant="label" className="mb-1 mt-2 text-gray-500">
            {t('search.recent')}
          </Text>
          {recents.map((term) => (
            <Pressable
              key={term}
              onPress={() => onRecent(term)}
              accessibilityRole="button"
              className="flex-row items-center border-b border-gray-100 py-3 active:opacity-70"
            >
              <Ionicons name="time-outline" size={18} color={colors.gray[400]} />
              <Text className="ml-3 flex-1 text-gray-800">{term}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.gray[300]} />
            </Pressable>
          ))}
        </>
      ) : null}

      {categories.length > 0 ? (
        <>
          <Text variant="label" className="mb-3 mt-5 text-gray-500">
            {t('search.cuisines')}
          </Text>
          <View className="flex-row flex-wrap gap-y-2">
            {categories.map((category) => (
              <FilterChip
                key={category.name}
                label={category.name}
                leading={category.emoji}
                onPress={() => onCuisine(category.name)}
              />
            ))}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
