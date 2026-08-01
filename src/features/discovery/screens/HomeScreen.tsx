import { ScrollView } from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartBar } from '@/features/cart';

import { FeaturedVideoCarousel } from '../components/FeaturedVideoCarousel';
import { RestaurantCarousel } from '../components/RestaurantCarousel';
import { SearchBar } from '../components/SearchBar';

/** Height of the CartBar overlay, so scrolled content can clear it. */
const CART_BAR_CLEARANCE = 96;

export function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-white px-3" edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        // Clears the floating CartBar, which sits above the system navigation.
        contentContainerStyle={{ paddingBottom: insets.bottom + CART_BAR_CLEARANCE }}
      >
        <SearchBar />
        <FeaturedVideoCarousel />
        <RestaurantCarousel />
      </ScrollView>
      <CartBar />
    </SafeAreaView>
  );
}
