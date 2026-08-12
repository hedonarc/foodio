/** PROTOTYPE — throwaway. Variant B: form-first, the map only confirms. */
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native';

import { AppleMaps, GoogleMaps } from 'expo-maps';

import { Button, Text } from '@/components/ui';
import type { Coordinates } from '@/utils/distance';
import { distanceBetween } from '@/utils/distance';

import { DEFAULT_RADIUS_M, formatRadius, LANDMARKS, MAX_RADIUS_M, MIN_RADIUS_M } from './shared';

const STEP_M = 500;

/**
 * No map interaction at all. GPS or nothing, a stepper for the radius, and the
 * radius is explained in *words* — which areas it reaches — with a small dead
 * map underneath purely to confirm the pin landed somewhere plausible.
 */
export function VariantB() {
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS_M);
  const [locating, setLocating] = useState(false);

  const locate = async () => {
    setLocating(true);
    try {
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({});
      setCenter({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    } finally {
      setLocating(false);
    }
  };

  const reached = center
    ? LANDMARKS.filter((l) => distanceBetween(center, l.at) <= radius).map((l) => l.name)
    : [];

  const circle = center
    ? [{ center, radius, color: 'rgba(249,115,22,0.18)', lineColor: '#f97316', lineWidth: 2 }]
    : [];

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="gap-5 px-4 pb-10 pt-4">
      <View className="gap-1">
        <Text variant="subheading" className="text-gray-900">
          Where do you cook?
        </Text>
        <Text variant="caption" className="text-gray-500">
          Stand in your kitchen and tap the button — that is the most accurate this gets.
        </Text>
      </View>

      <Button onPress={() => void locate()} disabled={locating}>
        {locating ? 'Finding you…' : center ? 'Update my location' : 'Use my current location'}
      </Button>

      {locating ? <ActivityIndicator /> : null}

      {center ? (
        <>
          <View className="h-40 overflow-hidden rounded-2xl border border-gray-200">
            {Platform.OS === 'ios' ? (
              <AppleMaps.View
                style={{ flex: 1 }}
                cameraPosition={{ coordinates: center, zoom: 11 }}
                circles={circle}
              />
            ) : (
              <GoogleMaps.View
                style={{ flex: 1 }}
                cameraPosition={{ coordinates: center, zoom: 11 }}
                circles={circle}
              />
            )}
          </View>

          <View className="gap-2">
            <Text variant="subheading" className="text-gray-900">
              How far will you go?
            </Text>

            <View className="flex-row items-center justify-between rounded-2xl bg-gray-100 p-3">
              <Pressable
                onPress={() => setRadius((r) => Math.max(MIN_RADIUS_M, r - STEP_M))}
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full bg-white"
              >
                <Text variant="subheading" className="text-gray-900">
                  −
                </Text>
              </Pressable>

              <Text variant="heading" className="text-gray-900">
                {formatRadius(radius)}
              </Text>

              <Pressable
                onPress={() => setRadius((r) => Math.min(MAX_RADIUS_M, r + STEP_M))}
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full bg-white"
              >
                <Text variant="subheading" className="text-gray-900">
                  +
                </Text>
              </Pressable>
            </View>

            <Text variant="caption" className="text-gray-500">
              {reached.length > 0
                ? `Reaches ${reached.join(', ')}.`
                : 'Does not reach any area we know by name yet — try going wider.'}
            </Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
