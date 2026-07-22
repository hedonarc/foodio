import { View } from 'react-native';

import { Image } from 'expo-image';

import { Text } from '@/components/ui';

import type { FeaturedVideo } from '../types/restaurant.types';

type FeaturedVideoCardProps = {
  video: FeaturedVideo;
};

export function FeaturedVideoCard({ video }: FeaturedVideoCardProps) {
  return (
    <View className="mr-3 w-40 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 relative">
      <View className="relative h-60 w-full bg-gray-200">
        <Image
          source={{ uri: video.thumbnail }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
        <View className="absolute bottom-0 inset-x-0 p-2.5">
          <Text
            variant="caption"
            className="font-bold text-white uppercase tracking-wider text-[10px]"
            style={{
              textShadowColor: 'rgba(0, 0, 0, 0.65)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {video.restaurantName}
          </Text>
        </View>
      </View>
    </View>
  );
}
