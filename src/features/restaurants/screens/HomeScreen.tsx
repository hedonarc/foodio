import { SafeAreaView } from 'react-native-safe-area-context';

import { FeaturedVideoCarousel } from '../components/FeaturedVideoCarousel';
import { RestaurantList } from '../components/RestaurantList';
import { SearchBar } from '../components/SearchBar';
import { MOCK_FEATURED_VIDEOS } from '../data/featured-videos.mock';
import { MOCK_RESTAURANTS } from '../data/restaurants.mock';

export function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <RestaurantList
        restaurants={MOCK_RESTAURANTS}
        ListHeaderComponent={
          <>
            <SearchBar />
            <FeaturedVideoCarousel videos={MOCK_FEATURED_VIDEOS} />
          </>
        }
      />
    </SafeAreaView>
  );
}
