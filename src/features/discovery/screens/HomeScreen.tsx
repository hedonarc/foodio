import { useState } from 'react';
import { View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { queryKeys } from '@/constants/queryKeys';
// Deep import: the identity barrel would close a cycle through restaurants.
import { IdentityChip } from '@/features/identity/components/IdentityChip';
import { useDebounce } from '@/hooks/useDebounce';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// Everything the home surface renders: the carousel and its clip shelves.
const HOME_KEYS = [queryKeys.restaurants.all, queryKeys.clips.all] as const;

import { RecentClips } from '../components/RecentClips';
import { RestaurantCarousel } from '../components/RestaurantCarousel';
import { RestaurantList } from '../components/RestaurantList';
import { SearchBar } from '../components/SearchBar';

const SEARCH_DEBOUNCE_MS = 300;

export function HomeScreen() {
  const [search, setSearch] = useState('');
  const query = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
  const { refreshing, onRefresh } = usePullToRefresh(HOME_KEYS);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white px-3">
      <RestaurantList
        query={query}
        refreshing={refreshing}
        onRefresh={onRefresh}
        header={
          <>
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <SearchBar value={search} onChange={setSearch} />
              </View>
              <IdentityChip />
            </View>

            <RestaurantCarousel query={query} />

            {/* Search turns the carousel into a vertical list of results; a
                shelf of unrelated Clips in the middle of them is noise. */}
            {query ? null : <RecentClips />}
          </>
        }
      />
    </SafeAreaView>
  );
}
