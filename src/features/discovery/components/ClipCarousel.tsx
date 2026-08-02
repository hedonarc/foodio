import { FlatList, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { ErrorState, LoadingState } from '@/components/shared';
import { Text } from '@/components/ui';

import { useClips } from '../hooks/useClips';

import { ClipCard } from './ClipCard';

export function ClipCarousel() {
  const { t } = useTranslation();
  const { data: clips, isPending, error, refetch } = useClips();

  // Promotional: an empty shelf draws attention to the gap.
  if (!isPending && !error && (!clips || clips.length === 0)) return null;

  return (
    <View className="mb-6">
      <View className="mb-3">
        <Text variant="subheading" className="text-gray-900">
          {t('home.clips')}
        </Text>
      </View>
      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {clips && clips.length > 0 ? (
        <FlatList
          data={clips}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <ClipCard clip={item} />}
        />
      ) : null}
    </View>
  );
}
