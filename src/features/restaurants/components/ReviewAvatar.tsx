import { View } from 'react-native';

import { Image } from 'expo-image';

import { Text } from '@/components/ui';

import { initialOf } from '../lib/reviewAvatar';

type ReviewAvatarProps = {
  author: string;
  avatar: string;
};

/** An empty `avatar` renders the author's initial — never a broken image. */
export function ReviewAvatar({ author, avatar }: ReviewAvatarProps) {
  if (avatar.length === 0) {
    return (
      <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-100">
        <Text variant="label" className="text-primary-700">
          {initialOf(author)}
        </Text>
      </View>
    );
  }

  return (
    <View className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
      <Image
        source={{ uri: avatar }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
