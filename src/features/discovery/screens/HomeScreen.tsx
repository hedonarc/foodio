import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

// Deep import: the identity barrel would close a cycle through restaurants.
import { IdentityChip } from '@/features/identity/components/IdentityChip';
import { useDebounce } from '@/hooks/useDebounce';

import { RestaurantCarousel } from '../components/RestaurantCarousel';
import { SearchBar } from '../components/SearchBar';

const SEARCH_DEBOUNCE_MS = 300;

export function HomeScreen() {
  const [search, setSearch] = useState('');
  const query = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white px-3">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </View>
          <IdentityChip />
        </View>

        <RestaurantCarousel query={query} />
      </ScrollView>
    </SafeAreaView>
  );
}
