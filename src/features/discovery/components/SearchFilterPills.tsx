import { ScrollView } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { SearchFilters } from '../lib/searchFilters';
import { toggleIn, TOGGLES } from '../lib/searchFilters';

import { FilterChip } from './FilterChip';

type SearchFilterPillsProps = {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
  onSortPress: () => void;
};

/**
 * Every filter in one row, always visible: the two or three people actually use
 * are one tap away rather than behind a button. Sort is the exception — four
 * radio options do not belong in a row of toggles, so its pill opens a sheet.
 */
export function SearchFilterPills({ filters, onChange, onSortPress }: SearchFilterPillsProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      className="flex-grow-0"
      contentContainerClassName="px-3 py-2"
    >
      <FilterChip
        label={`${t('search.sort')} · ${t(`search.sorts.${filters.sort}`)}`}
        on={filters.sort !== 'nearest'}
        onPress={onSortPress}
      />
      {filters.cuisines.map((cuisine) => (
        <FilterChip
          key={cuisine}
          label={cuisine}
          on
          removable
          accessibilityLabel={t('search.removeFilter', { filter: cuisine })}
          onPress={() => onChange({ ...filters, cuisines: toggleIn(filters.cuisines, cuisine) })}
        />
      ))}
      {TOGGLES.map((toggle) => (
        <FilterChip
          key={toggle}
          label={t(`search.toggles.${toggle}`)}
          on={filters.toggles.includes(toggle)}
          onPress={() => onChange({ ...filters, toggles: toggleIn(filters.toggles, toggle) })}
        />
      ))}
    </ScrollView>
  );
}
