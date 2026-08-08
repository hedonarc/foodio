import { useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { SheetContainer, Text } from '@/components/ui';
import { colors } from '@/theme';

import type { Country } from '../lib/countries';
import { flagOf, searchCountries } from '../lib/countries';

type CountryPickerSheetProps = {
  visible: boolean;
  selectedIso2: string;
  onSelect: (country: Country) => void;
  onClose: () => void;
};

export function CountryPickerSheet({
  visible,
  selectedIso2,
  onSelect,
  onClose,
}: CountryPickerSheetProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const results = searchCountries(query);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <SheetContainer visible={visible} onClose={close}>
      <Text variant="subheading" className="text-gray-900">
        {t('identity.country.title')}
      </Text>

      <TextInput
        accessibilityLabel={t('identity.country.search')}
        placeholder={t('identity.country.search')}
        placeholderTextColor={colors.gray[400]}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoCapitalize="none"
        className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900"
      />

      {/* Bounded so the list scrolls inside the sheet rather than growing it. */}
      <View className="mt-3 h-80">
        <FlatList
          data={results}
          keyExtractor={(country) => country.iso2}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text variant="body" className="py-6 text-center text-gray-400">
              {t('identity.country.noMatch')}
            </Text>
          }
          renderItem={({ item: country }) => (
            <Pressable
              onPress={() => {
                setQuery('');
                onSelect(country);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: country.iso2 === selectedIso2 }}
              className="flex-row items-center py-3 active:opacity-60"
            >
              <Text variant="body">{flagOf(country.iso2)}</Text>
              <Text variant="body" className="ml-3 flex-1 text-gray-900" numberOfLines={1}>
                {country.name}
              </Text>
              <Text variant="body" className="text-gray-500">
                +{country.dial}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </SheetContainer>
  );
}
