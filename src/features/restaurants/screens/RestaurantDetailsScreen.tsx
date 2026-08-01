import { ScrollView, View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Menu } from '@/features/menu';

import { RestaurantGallery } from '../components/RestaurantGallery';
import { RestaurantHeader } from '../components/RestaurantHeader';
import { RestaurantHero } from '../components/RestaurantHero';
import { RestaurantHours } from '../components/RestaurantHours';
import { RestaurantInfo } from '../components/RestaurantInfo';
import { RestaurantRating } from '../components/RestaurantRating';
import { RestaurantReviewPreview } from '../components/RestaurantReviewPreview';
import { MOCK_RESTAURANTS } from '../data/restaurant.mock';

export function RestaurantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurant = MOCK_RESTAURANTS.find((r) => r.id === id);

  if (!restaurant) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text variant="subheading" className="text-gray-400">
          Restaurant not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <RestaurantHeader name={restaurant.name} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <RestaurantHero image={restaurant.image} name={restaurant.name} />
        <RestaurantRating rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
        <View className="border-b border-gray-100">
          <RestaurantInfo
            cuisine={restaurant.cuisine}
            deliveryTime={restaurant.deliveryTime}
            deliveryFee={restaurant.deliveryFee}
            distance={restaurant.distance}
            address={restaurant.address}
            description={restaurant.description}
          />
        </View>
        <Menu restaurantId={restaurant.id} />
        <RestaurantGallery images={restaurant.gallery} />
        <RestaurantHours hours={restaurant.hours} />
        <RestaurantReviewPreview reviews={restaurant.reviews} />
      </ScrollView>
    </SafeAreaView>
  );
}
