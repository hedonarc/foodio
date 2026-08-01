import { ScrollView, View } from 'react-native';

import { CartBar } from '@/features/cart';

import { FeaturedVideoCarousel } from '../components/FeaturedVideoCarousel';
import { RestaurantCarousel } from '../components/RestaurantCarousel';
import { SearchBar } from '../components/SearchBar';

const CART_BAR_CLEARANCE = 96;

export function HomeScreen() {
  return (
    <View className="flex-1 bg-white px-3">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: CART_BAR_CLEARANCE }}
      >
        <SearchBar />
        <FeaturedVideoCarousel />
        <RestaurantCarousel />
      </ScrollView>
      <CartBar />
    </View>
  );
}
