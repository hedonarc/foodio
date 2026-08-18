import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { ScreenHeader } from '@/components/shared';
import { Button, Text, TextField } from '@/components/ui';
import {
  DeliveryAreaMap,
  formatRadius,
  LAHORE,
  RADIUS_CHOICES,
  zoomForRadius,
} from '@/features/manage';
import { colors } from '@/theme';
import type { Coordinates } from '@/utils/distance';

import { useCreateRestaurant } from '../hooks/useCreateRestaurant';
import type { ClaimFormValues } from '../types/claim.types';
import { claimFormSchema } from '../types/claim.types';

const STARTING_RADIUS = 3_000;

/**
 * Claiming a restaurant: a name, a place, and nothing else.
 *
 * t5 rejected a wizard because nothing would be saved until the last step, so
 * an interrupted signup loses everything. The two steps here are one POST — an
 * interruption costs a name and a dragged pin, not a profile — and they are
 * split only because the map wants the whole screen to be worth anything (t8),
 * which a text field competing for it would take away.
 *
 * Everything else the API accepts is defaulted server-side. The unfinished
 * restaurant then lives in the Manage hub as `onboarding`, invisible to
 * customers until someone adds a dish and deliberately goes live (t2).
 */
export function ClaimRestaurantScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const create = useCreateRestaurant();

  const [step, setStep] = useState<'name' | 'place'>('name');
  const [point, setPoint] = useState<Coordinates>(LAHORE);
  const [radius, setRadius] = useState(STARTING_RADIUS);
  const [camera, setCamera] = useState({ center: LAHORE, zoom: zoomForRadius(STARTING_RADIUS) });

  const { control, handleSubmit, getValues } = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: { name: '' },
  });

  const chooseRadius = (meters: number) => {
    setRadius(meters);
    setCamera({ center: point, zoom: zoomForRadius(meters) });
  };

  /**
   * Asked here rather than at app start, because the reason is on screen. A
   * refusal is not a dead end: the map opens on Lahore and they drag, exactly
   * as they would have anyway. Permission is a shortcut, never a gate (t8).
   */
  const startFromHere = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return;

    const position = await Location.getCurrentPositionAsync({});
    const here = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    setPoint(here);
    setCamera({ center: here, zoom: zoomForRadius(radius) });
  };

  const claim = () => {
    create.mutate(
      {
        name: getValues('name').trim(),
        latitude: point.latitude,
        longitude: point.longitude,
        deliveryRadiusMeters: radius,
      },
      // The role is already the new restaurant's Kitchen by the time this runs,
      // so replace rather than push: there is no customer screen to go back to.
      { onSuccess: () => router.replace('/manage') },
    );
  };

  if (step === 'name') {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-white">
        <ScreenHeader title={t('claim.title')} />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="gap-4 px-4">
            <Text variant="caption" className="text-gray-500">
              {t('claim.nameHint')}
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <TextField
                  label={t('claim.nameLabel')}
                  placeholder={t('claim.namePlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  autoFocus
                  error={fieldState.error ? t('claim.errors.name') : undefined}
                />
              )}
            />

            <Button onPress={() => void handleSubmit(() => setStep('place'))()}>
              {t('common.continue')}
            </Button>

            <Text variant="caption" className="text-gray-400">
              {t('claim.invisibleHint')}
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t('claim.placeTitle')} onBack={() => setStep('name')} />

      <View className="flex-1">
        <DeliveryAreaMap point={point} camera={camera} radiusMeters={radius} onMove={setPoint} />

        <Pressable
          onPress={() => void startFromHere()}
          accessibilityRole="button"
          accessibilityLabel={t('claim.useMyLocation')}
          className="absolute right-4 top-4 h-11 w-11 items-center justify-center rounded-full bg-white shadow"
        >
          <Ionicons name="locate" size={20} color={colors.gray[800]} />
        </Pressable>
      </View>

      <View className="gap-3 border-t border-gray-200 bg-white px-4 pb-8 pt-4">
        <Text variant="subheading" className="text-gray-900">
          {t('claim.placeHeading')}
        </Text>
        <Text variant="caption" className="text-gray-500">
          {t('claim.placeHint', { radius: formatRadius(radius) })}
        </Text>

        <View className="mt-1 flex-row flex-wrap gap-2">
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
              <Text variant="label" className={meters === radius ? 'text-white' : 'text-gray-700'}>
                {formatRadius(meters)}
              </Text>
            </Pressable>
          ))}
        </View>

        {create.error ? (
          <Text variant="caption" className="text-error-500" accessibilityLiveRegion="polite">
            {toApiError(create.error).message}
          </Text>
        ) : null}

        <Button onPress={claim} disabled={create.isPending}>
          {create.isPending ? t('claim.creating') : t('claim.create')}
        </Button>
      </View>
    </SafeAreaView>
  );
}
