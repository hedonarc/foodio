import { ActivityIndicator, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Photo } from '@/components/ui';
import { cn } from '@/lib/cn';
import { colors } from '@/theme';

type PhotoButtonProps = {
  /** Empty means there is none yet, and the camera prompt shows instead. */
  uri: string;
  onPress: () => void;
  isBusy: boolean;
  accessibilityLabel: string;
  accessibilityHint: string;
  /** Sizing. The dashed frame and the picture both fill it. */
  className?: string;
};

/**
 * Tap to set a photograph. The dashed frame stays visible around an existing
 * picture, so a slot that already has one still reads as something you can
 * change rather than as decoration.
 */
export function PhotoButton({
  uri,
  onPress,
  isBusy,
  accessibilityLabel,
  accessibilityHint,
  className,
}: PhotoButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isBusy}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: isBusy }}
      className={cn(
        'items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 active:opacity-70',
        className,
      )}
    >
      {isBusy ? (
        <ActivityIndicator size="small" color={colors.gray[400]} />
      ) : uri ? (
        <Photo uri={uri} className="h-full w-full" />
      ) : (
        <View className="items-center">
          <Ionicons name="camera-outline" size={20} color={colors.gray[400]} />
        </View>
      )}
    </Pressable>
  );
}
