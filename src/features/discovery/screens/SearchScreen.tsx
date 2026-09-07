import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState } from '@/components/shared';
import { Text } from '@/components/ui';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useSearchStore } from '@/stores/search.store';
import { colors } from '@/theme';

import { SearchBar } from '../components/SearchBar';
import { SearchBrowse } from '../components/SearchBrowse';
import { SearchFilterPills } from '../components/SearchFilterPills';
import { SearchResultRow } from '../components/SearchResultRow';
import { SortSheet } from '../components/SortSheet';
import { useSearch } from '../hooks/useSearch';

/**
 * Search has the whole screen: the field, a row of pills under it, and either
 * something to browse or rows of results. Chosen over a sheet on Home and over
 * results in place — see issue #183.
 */
export function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const guard = useNavigationGuard();
  const { cuisine } = useLocalSearchParams<{ cuisine?: string }>();

  const search = useSearch(cuisine);
  const recents = useSearchStore((state) => state.recents);
  const remember = useSearchStore((state) => state.remember);
  const [sortOpen, setSortOpen] = useState(false);

  const open = (restaurantId: string) => {
    remember(search.text);
    guard(() => router.push(`/restaurant/${restaurantId}`));
  };

  const caption = `${t('search.places', { count: search.results.length })} · ${t(
    'search.sortedBy',
    { sort: t(`search.sorts.${search.filters.sort}`) },
  )}`;

  return (
    // The root Stack pads every screen for the safe area; a SafeAreaView here
    // would pad it twice.
    <View className="flex-1 bg-white">
      <View className="flex-row items-center gap-2 px-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
        >
          <Ionicons name="chevron-back" size={22} color={colors.gray[900]} />
        </Pressable>
        <SearchBar
          value={search.text}
          onChange={search.setText}
          onSubmit={() => remember(search.text)}
          autoFocus
        />
      </View>

      <SearchFilterPills
        filters={search.filters}
        onChange={search.setFilters}
        onSortPress={() => setSortOpen(true)}
      />

      {search.isBrowsing ? (
        <SearchBrowse
          recents={recents}
          categories={search.categories}
          onRecent={search.setText}
          onCuisine={(name) => search.setFilters({ ...search.filters, cuisines: [name] })}
        />
      ) : search.isPending ? (
        <LoadingState className="flex-1 items-center justify-center" />
      ) : search.error ? (
        <ErrorState
          error={search.error}
          onRetry={search.refetch}
          className="flex-1 items-center justify-center px-8"
        />
      ) : (
        <FlashList
          data={search.results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-3 pb-8"
          ListHeaderComponent={
            <Text variant="caption" className="mb-1 mt-1 text-gray-500">
              {caption}
            </Text>
          }
          ListEmptyComponent={<EmptyState message={t('search.nothingMatched')} />}
          renderItem={({ item }) => (
            <SearchResultRow restaurant={item} onPress={() => open(item.id)} />
          )}
        />
      )}

      <SortSheet
        visible={sortOpen}
        sort={search.filters.sort}
        onPick={(sort) => {
          search.setFilters({ ...search.filters, sort });
          setSortOpen(false);
        }}
        onClose={() => setSortOpen(false)}
      />
    </View>
  );
}
