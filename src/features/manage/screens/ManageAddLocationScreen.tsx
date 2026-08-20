import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { ScreenHeader } from '@/components/shared';
import { Button, Text, TextField } from '@/components/ui';
import { useRestaurant } from '@/features/restaurants';
import { useSessionStore } from '@/stores/session.store';
import type { Coordinates } from '@/utils/distance';

import { createBranch } from '../api/branch.api';
import { DeliveryAreaMap } from '../components/DeliveryAreaMap';
import { formatRadius, RADIUS_CHOICES, zoomForRadius } from '../lib/deliveryArea';

const STARTING_RADIUS = 3_000;

/**
 * Another location for this Chain.
 *
 * It asks only for what a Branch genuinely owns — where it is, how far it
 * delivers, and its address. The name, cuisines, imagery and whole Menu come
 * from the parent, which is most of why adding a location is not the same job
 * as claiming a restaurant.
 */
export function ManageAddLocationScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const role = useSessionStore((state) => state.role);
  const restaurantId = role.kind === 'kitchen' ? role.restaurantId : '';
  const { data: parent } = useRestaurant(restaurantId);

  const start: Coordinates = parent
    ? { latitude: parent.latitude, longitude: parent.longitude }
    : { latitude: 31.5204, longitude: 74.3587 };

  const [address, setAddress] = useState('');
  const [point, setPoint] = useState<Coordinates>(start);
  const [radius, setRadius] = useState(STARTING_RADIUS);
  const [camera, setCamera] = useState({ center: start, zoom: zoomForRadius(STARTING_RADIUS) });

  const add = useMutation({
    mutationFn: () =>
      createBranch(restaurantId, {
        address: address.trim(),
        latitude: point.latitude,
        longitude: point.longitude,
        deliveryRadiusMeters: radius,
      }),
  });

  const chooseRadius = (meters: number) => {
    setRadius(meters);
    setCamera({ center: point, zoom: zoomForRadius(meters) });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t('manage.addLocation.title')} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="h-64">
          <DeliveryAreaMap point={point} camera={camera} radiusMeters={radius} onMove={setPoint} />
        </View>

        <ScrollView contentContainerClassName="gap-3 px-4 pt-4" keyboardShouldPersistTaps="handled">
          <Text variant="subheading" className="text-gray-900">
            {t('manage.addLocation.heading')}
          </Text>
          <Text variant="caption" className="text-gray-500">
            {t('manage.addLocation.hint', { radius: formatRadius(radius) })}
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {RADIUS_CHOICES.map((meters) => (
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
                <Text
                  variant="label"
                  className={meters === radius ? 'text-white' : 'text-gray-700'}
                >
                  {formatRadius(meters)}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextField
            label={t('manage.addLocation.addressLabel')}
            placeholder={t('manage.addLocation.addressPlaceholder')}
            value={address}
            onChangeText={setAddress}
          />

          {add.error ? (
            <View className="flex-row items-start gap-2 rounded-2xl bg-error-100 p-3">
              <Ionicons name="alert-circle-outline" size={16} color="#B3261E" />
              <View className="flex-1 gap-1">
                {/* The server's own words: it names the plan that lifts the limit. */}
                <Text variant="caption" className="text-error-700" accessibilityLiveRegion="polite">
                  {toApiError(add.error).message}
                </Text>
                {/* A Pressable, not a Text with onPress: a recovery link needs a
                    tap target bigger than its own glyphs. */}
                <Pressable
                  onPress={() => router.push('/manage/subscription')}
                  accessibilityRole="button"
                  hitSlop={12}
                  className="self-start py-1"
                >
                  <Text variant="caption" className="font-semibold text-error-700">
                    {t('manage.addLocation.seePlans')}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <Button
            onPress={() => add.mutate(undefined, { onSuccess: () => router.back() })}
            disabled={address.trim() === '' || add.isPending}
          >
            {add.isPending ? t('common.saving') : t('manage.addLocation.action')}
          </Button>

          <Text variant="caption" className="pb-8 text-gray-400">
            {t('manage.addLocation.inheritHint')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
