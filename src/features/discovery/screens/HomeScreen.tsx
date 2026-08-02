import { useState } from 'react';
import { ScrollView } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useDebounce } from '@/hooks/useDebounce';

import { ClipCarousel } from '../components/ClipCarousel';
import { RestaurantCarousel } from '../components/RestaurantCarousel';
import { SearchBar } from '../components/SearchBar';

const SEARCH_DEBOUNCE_MS = 300;

export function HomeScreen() {
  const [search, setSearch] = useState('');
  const query = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
  const isSearching = query.length > 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white px-3">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <SearchBar value={search} onChange={setSearch} />

        {isSearching ? null : <ClipCarousel />}

        <RestaurantCarousel query={query} />
      </ScrollView>
    </SafeAreaView>
  );
}
