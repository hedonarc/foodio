import { FlatList, View } from 'react-native';

import { Image } from 'expo-image';

import { Text } from '@/components/ui';

type RestaurantGalleryProps = {
  images: string[];
};

export function RestaurantGallery({ images }: RestaurantGalleryProps) {
  if (images.length === 0) return null;

  return (
    <View className="mb-2">
      <Text variant="bodyMedium" className="mb-3 px-4 text-gray-900">
        Gallery
      </Text>
      <FlatList
        data={images}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <View className="mr-3 h-28 w-44 overflow-hidden rounded-xl bg-gray-200">
            <Image
              source={{ uri: item }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
          </View>
        )}
      />
    </View>
  );
}
