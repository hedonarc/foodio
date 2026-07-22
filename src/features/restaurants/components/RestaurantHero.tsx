import { View } from 'react-native';

import { Image } from 'expo-image';

type RestaurantHeroProps = {
  image: string;
  name: string;
};

export function RestaurantHero({ image, name }: RestaurantHeroProps) {
  return (
    <View className="h-56 w-full bg-gray-200">
      <Image
        source={{ uri: image }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={200}
        accessibilityLabel={name}
      />
    </View>
  );
}
