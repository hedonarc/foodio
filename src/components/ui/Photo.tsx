import { View } from 'react-native';

import { Image } from 'expo-image';

import { cn } from '@/lib/cn';

type PhotoProps = {
  /** Empty means there is no photograph — not that one failed to load. */
  uri: string;
  /** Sizing and shape of the frame. The image always fills it. */
  className?: string;
  accessibilityLabel?: string;
};

/**
 * Renders nothing at all when there is no photograph.
 *
 * The grey box these sites used to show was never a placeholder — it was the
 * frame's own background with an `expo-image` on top of it, so a photograph
 * that failed to load and one that was never set looked identical. Keeping the
 * grey only where a `uri` exists makes it what it should have been all along:
 * the loading state. See ADR-0015 in the backend repo.
 */
export function Photo({ uri, className, accessibilityLabel }: PhotoProps) {
  if (!uri) return null;

  return (
    <View className={cn('overflow-hidden bg-gray-200', className)}>
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={200}
        {...(accessibilityLabel === undefined ? {} : { accessibilityLabel })}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
