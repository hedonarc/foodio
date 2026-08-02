import { FlatList, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';

import { useRestaurantClips } from '../hooks/useRestaurantClips';
import type { Clip } from '../types/clip.types';
import { isCustomerClip } from '../types/clip.types';

import { ClipCard } from './ClipCard';

type RestaurantClipsProps = {
  restaurantId: string;
  restaurantName: string;
};

/**
 * Ours and theirs, restaurant first: claim, then evidence. Each shelf renders
 * only when it has something — no placeholder, no "be the first".
 */
export function RestaurantClips({ restaurantId, restaurantName }: RestaurantClipsProps) {
  const { t } = useTranslation();
  const { data: clips } = useRestaurantClips(restaurantId);

  if (!clips || clips.length === 0) return null;

  const restaurantClips = clips.filter((clip) => !isCustomerClip(clip));
  const customerClips = clips.filter(isCustomerClip);

  return (
    <View className="border-b border-gray-100 px-4 py-5">
      <Shelf
        title={t('restaurant.clipsFromRestaurant', { name: restaurantName })}
        clips={restaurantClips}
      />
      <Shelf title={t('restaurant.clipsFromCustomers')} clips={customerClips} />
    </View>
  );
}

type ShelfProps = {
  title: string;
  clips: Clip[];
};

function Shelf({ title, clips }: ShelfProps) {
  if (clips.length === 0) return null;

  return (
    <View className="mb-2">
      <Text variant="subheading" className="mb-3 text-gray-900">
        {title}
      </Text>
      <FlatList
        data={clips}
        keyExtractor={(clip) => clip.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <ClipCard clip={item} showRestaurantName={false} />}
      />
    </View>
  );
}
