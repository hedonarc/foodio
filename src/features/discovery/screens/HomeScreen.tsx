import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { CartBar } from '@/features/cart';
import { useDebounce } from '@/hooks/useDebounce';
import { colors } from '@/theme';

import { FeaturedVideoCarousel } from '../components/FeaturedVideoCarousel';
import { RestaurantCarousel } from '../components/RestaurantCarousel';
import { SearchBar } from '../components/SearchBar';

const CART_BAR_CLEARANCE = 96;
const SEARCH_DEBOUNCE_MS = 300;

export function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const query = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
  const isSearching = query.length > 0;

  return (
    <View className="flex-1 bg-white px-3">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: CART_BAR_CLEARANCE }}
      >
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </View>
          <Pressable
            onPress={() => router.push('/orders')}
            accessibilityRole="button"
            accessibilityLabel={t('orders.title')}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 active:bg-gray-200"
          >
            <Ionicons name="receipt-outline" size={20} color={colors.gray[700]} />
          </Pressable>
        </View>

        {isSearching ? null : <FeaturedVideoCarousel />}

        <RestaurantCarousel query={query} />
      </ScrollView>
      <CartBar />
    </View>
  );
}
