import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { useEvent } from 'expo';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { usePlaybackStore } from '@/stores/playback.store';
import { colors } from '@/theme';

import type { Clip } from '../types/clip.types';
import { isCustomerClip } from '../types/clip.types';

type ClipFeedCellProps = {
  clip: Clip;
  height: number;
  isActive: boolean;
  reduceMotion: boolean;
  /** Off when the viewer was opened from the restaurant page — the menu is one back away. */
  showViewMenu?: boolean;
};

export function ClipFeedCell({
  clip,
  height,
  isActive,
  reduceMotion,
  showViewMenu = true,
}: ClipFeedCellProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const muted = usePlaybackStore((state) => state.muted);
  const toggleMuted = usePlaybackStore((state) => state.toggleMuted);

  const player = useVideoPlayer(clip.mediaUrl, (instance) => {
    instance.loop = true;
    instance.muted = true;
    // Muted autoplay must not silence the user's music (#24).
    instance.audioMixingMode = 'mixWithOthers';
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    player.muted = muted;
    player.audioMixingMode = muted ? 'mixWithOthers' : 'auto';
  }, [player, muted]);

  useEffect(() => {
    // Reduce motion: never autoplay, play once on request.
    player.loop = !reduceMotion;

    if (!isActive) {
      player.pause();
      player.currentTime = 0;
      return;
    }
    if (!reduceMotion) player.play();
  }, [player, isActive, reduceMotion]);

  const author = isCustomerClip(clip)
    ? t('clips.customerClipLabel', { restaurant: clip.restaurantName, caption: clip.caption })
    : t('clips.restaurantClipLabel', { restaurant: clip.restaurantName, caption: clip.caption });

  return (
    <View style={{ height }} className="bg-black" accessible accessibilityLabel={author}>
      <VideoView
        player={player}
        style={{ flex: 1 }}
        contentFit="cover"
        nativeControls={false}
        importantForAccessibility="no"
        accessibilityElementsHidden
      />

      {/* Poster: covers buffering, scroll-away resets, and reduce-motion. */}
      {isPlaying ? null : (
        <Image
          source={{ uri: clip.thumbnailUrl }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
        />
      )}

      {reduceMotion && isActive && !isPlaying ? (
        <Pressable
          onPress={() => player.play()}
          accessibilityRole="button"
          accessibilityLabel={t('clips.play')}
          className="absolute inset-0 items-center justify-center"
        >
          <View className="h-16 w-16 items-center justify-center rounded-full bg-black/50">
            <Ionicons name="play" size={30} color={colors.white} />
          </View>
        </Pressable>
      ) : null}

      <Pressable
        onPress={toggleMuted}
        accessibilityRole="button"
        accessibilityLabel={muted ? t('clips.unmuteAll') : t('clips.muteAll')}
        hitSlop={8}
        style={{ top: insets.top + 12 }}
        className="absolute right-4 h-10 w-10 items-center justify-center rounded-full bg-black/50"
      >
        <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={18} color={colors.white} />
      </Pressable>

      <View className="absolute inset-x-0 bottom-0 p-4 pb-5">
        <View
          className={
            isCustomerClip(clip)
              ? 'mb-2 flex-row items-center self-start rounded-full bg-emerald-500/90 px-2.5 py-1'
              : 'mb-2 flex-row items-center self-start rounded-full bg-black/50 px-2.5 py-1'
          }
        >
          <Ionicons
            name={isCustomerClip(clip) ? 'checkmark-circle' : 'storefront-outline'}
            size={12}
            color={colors.white}
          />
          <Text variant="caption" className="ml-1 text-white">
            {isCustomerClip(clip) ? t('clips.receiptBadge') : t('clips.marketingBadge')}
          </Text>
        </View>

        <Text variant="bodyMedium" className="text-white">
          {clip.restaurantName}
        </Text>
        <Text variant="caption" className="mt-0.5 text-gray-200" numberOfLines={2}>
          {clip.caption}
        </Text>

        {showViewMenu ? (
          <Pressable
            onPress={() => router.push(`/restaurant/${clip.restaurantId}`)}
            accessibilityRole="button"
            accessibilityLabel={t('clips.viewMenu')}
            className="mt-3 flex-row items-center justify-between self-start rounded-2xl bg-white/95 px-4 py-2.5 active:bg-white"
          >
            <Text variant="label" className="text-gray-900">
              {t('clips.viewMenu')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gray[700]} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
