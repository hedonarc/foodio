import { useState } from 'react';
import { Pressable, View } from 'react-native';

import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { ErrorState, LoadingState, ScreenHeader } from '@/components/shared';
import { Button, Text } from '@/components/ui';
import type { Restaurant } from '@/features/restaurants';
import { useRestaurant } from '@/features/restaurants';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';
import type { Coordinates } from '@/utils/distance';

import { DeliveryAreaMap } from '../components/DeliveryAreaMap';
import { useUpdateRestaurant } from '../hooks/useUpdateRestaurant';
import {
  formatRadius,
  hasChanged,
  movedFar,
  radiusChoicesFor,
  zoomForRadius,
} from '../lib/deliveryArea';

export function ManageDeliveryAreaScreen() {
  const router = useRouter();

  const role = useSessionStore((state) => state.role);
  const restaurantId = role.kind === 'kitchen' ? role.restaurantId : '';

  const { data: restaurant, isPending, error, refetch } = useRestaurant(restaurantId);

  if (isPending) return <LoadingState className="flex-1 items-center justify-center" />;
  if (error || !restaurant) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        className="flex-1 items-center justify-center px-8"
      />
    );
  }

  // Keyed so a role change underneath rebuilds the draft rather than leaving a
  // pin from one restaurant hovering over another's map.
  return (
    <DeliveryAreaEditor key={restaurant.id} restaurant={restaurant} onSaved={() => router.back()} />
  );
}

type DeliveryAreaEditorProps = {
  restaurant: Restaurant;
  onSaved: () => void;
};

function DeliveryAreaEditor({ restaurant, onSaved }: DeliveryAreaEditorProps) {
  const { t } = useTranslation();
  const update = useUpdateRestaurant(restaurant.id);

  const saved = {
    point: { latitude: restaurant.latitude, longitude: restaurant.longitude },
    radiusMeters: restaurant.deliveryRadiusMeters,
  };

  const [point, setPoint] = useState<Coordinates>(saved.point);
  const [radius, setRadius] = useState(saved.radiusMeters);
  const [camera, setCamera] = useState({
    center: saved.point,
    zoom: zoomForRadius(saved.radiusMeters),
  });
  const [locating, setLocating] = useState(false);

  const choices = radiusChoicesFor(saved.radiusMeters);
  const dirty = hasChanged(saved, { point, radiusMeters: radius });

  const chooseRadius = (meters: number) => {
    setRadius(meters);
    // Refit, so a bigger circle is a bigger circle rather than the same view.
    setCamera({ center: point, zoom: zoomForRadius(meters) });
  };

  /**
   * Permission is asked here, with the map on screen, because that is where
   * the reason is visible. Refusing must leave the screen usable — the pin is
   * already on the restaurant, and dragging never needed permission.
   */
  const locateMe = async () => {
    setLocating(true);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;

      const position = await Location.getCurrentPositionAsync({});
      const here = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setPoint(here);
      setCamera({ center: here, zoom: zoomForRadius(radius) });
    } finally {
      setLocating(false);
    }
  };

  const save = () => {
    update.mutate(
      { latitude: point.latitude, longitude: point.longitude, deliveryRadiusMeters: radius },
      { onSuccess: onSaved },
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t('manage.area.title')} />

      <View className="flex-1">
        <DeliveryAreaMap point={point} camera={camera} radiusMeters={radius} onMove={setPoint} />

        <Pressable
          onPress={() => void locateMe()}
          disabled={locating}
          accessibilityRole="button"
          accessibilityLabel={t('manage.area.useMyLocation')}
          className="absolute right-4 top-4 h-11 w-11 items-center justify-center rounded-full bg-white shadow"
        >
          <Ionicons
            name="locate"
            size={20}
            color={locating ? colors.gray[400] : colors.gray[800]}
          />
        </Pressable>
      </View>

      <View className="gap-3 border-t border-gray-200 bg-white px-4 pb-8 pt-4">
        <Text variant="subheading" className="text-gray-900">
          {t('manage.area.heading')}
        </Text>
        <Text variant="caption" className="text-gray-500">
          {t('manage.area.explainer', { radius: formatRadius(radius) })}
        </Text>

        <View className="mt-1 flex-row flex-wrap gap-2">
          {choices.map((meters) => (
            <Pressable
              key={meters}
              onPress={() => chooseRadius(meters)}
              accessibilityRole="button"
              accessibilityState={{ selected: meters === radius }}
              className={
                meters === radius
                  ? 'rounded-full bg-primary-500 px-3 py-2'
                  : 'rounded-full bg-gray-100 px-3 py-2'
              }
            >
              <Text variant="label" className={meters === radius ? 'text-white' : 'text-gray-700'}>
                {formatRadius(meters)}
              </Text>
            </Pressable>
          ))}
        </View>

        {movedFar(saved.point, point) ? (
          <View className="flex-row items-start gap-2 rounded-2xl bg-warning-100 p-3">
            <Ionicons name="alert-circle-outline" size={16} color={colors.warning[700]} />
            <Text variant="caption" className="flex-1 text-warning-700">
              {t('manage.area.movedFar')}
            </Text>
          </View>
        ) : null}

        {update.error ? (
          <Text variant="caption" className="text-error-500" accessibilityLiveRegion="polite">
            {toApiError(update.error).message}
          </Text>
        ) : null}

        <Button onPress={save} disabled={!dirty || update.isPending}>
          {update.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </View>
    </SafeAreaView>
  );
}
