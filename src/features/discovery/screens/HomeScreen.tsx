import { ScrollView } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { FeaturedVideoCarousel } from '../components/FeaturedVideoCarousel';
import { RestaurantCarousel } from '../components/RestaurantCarousel';
import { SearchBar } from '../components/SearchBar';
import { MOCK_RESTAURANT_PREVIEWS } from '../data/discovery.mock';
import { MOCK_FEATURED_VIDEOS } from '../data/featuredVideos.mock';

export function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white px-3" edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <SearchBar />
        <FeaturedVideoCarousel videos={MOCK_FEATURED_VIDEOS} />
        <RestaurantCarousel restaurants={MOCK_RESTAURANT_PREVIEWS} />
      </ScrollView>
    </SafeAreaView>
  );
}
