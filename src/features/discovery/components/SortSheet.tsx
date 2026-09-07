import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { SheetContainer, Text } from '@/components/ui';
import { colors } from '@/theme';

import type { SortKey } from '../lib/searchFilters';
import { SORTS } from '../lib/searchFilters';

type SortSheetProps = {
  visible: boolean;
  sort: SortKey;
  onPick: (sort: SortKey) => void;
  onClose: () => void;
};

export function SortSheet({ visible, sort, onPick, onClose }: SortSheetProps) {
  const { t } = useTranslation();

  return (
    <SheetContainer visible={visible} onClose={onClose}>
      <Text variant="subheading" className="mb-2 text-gray-900">
        {t('search.sortTitle')}
      </Text>
      <View accessibilityRole="radiogroup">
        {SORTS.map((option) => {
          const chosen = option === sort;
          return (
            <Pressable
              key={option}
              onPress={() => onPick(option)}
              accessibilityRole="radio"
              accessibilityState={{ checked: chosen }}
              className="flex-row items-center py-3 active:opacity-70"
            >
              <Ionicons
                name={chosen ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={chosen ? colors.primary[500] : colors.gray[300]}
              />
              <Text className="ml-3 text-gray-900">{t(`search.sorts.${option}`)}</Text>
            </Pressable>
          );
        })}
      </View>
    </SheetContainer>
  );
}
