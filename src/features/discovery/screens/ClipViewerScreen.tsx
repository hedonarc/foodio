import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, LoadingState } from '@/components/shared';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors } from '@/theme';

import { ClipFeedCell } from '../components/ClipFeedCell';
import { useClips } from '../hooks/useClips';

/** One clip, full screen — reached from a shelf card, left with the close button. */
export function ClipViewerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const reduceMotion = useReduceMotion();
  const { data: clips, isPending } = useClips();
  const [height, setHeight] = useState(0);

  const clip = clips?.find((candidate) => candidate.id === id);

  return (
    <View className="flex-1 bg-black" onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      {isPending ? <LoadingState className="flex-1 items-center justify-center" /> : null}

      {!isPending && !clip ? (
        <EmptyState
          message={t('clips.notFound')}
          className="flex-1 items-center justify-center px-8"
        />
      ) : null}

      {clip && height > 0 ? (
        <ClipFeedCell
          clip={clip}
          height={height}
          isActive
          reduceMotion={reduceMotion}
          showViewMenu={false}
          ownsBottomEdge
        />
      ) : null}

      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        hitSlop={8}
        style={{ top: insets.top + 12 }}
        className="absolute left-4 h-10 w-10 items-center justify-center rounded-full bg-black/50"
      >
        <Ionicons name="close" size={20} color={colors.white} />
      </Pressable>
    </View>
  );
}
