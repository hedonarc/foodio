/** PROTOTYPE — throwaway. Variant A: map-first, drag the map under a fixed pin. */
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { AppleMaps, GoogleMaps } from 'expo-maps';

import { Text } from '@/components/ui';
import type { Coordinates } from '@/utils/distance';

import { DEFAULT_RADIUS_M, formatRadius, LAHORE, MAX_RADIUS_M, MIN_RADIUS_M } from './shared';

const STEPS = [500, 1_000, 2_000, 3_000, 5_000, 8_000, 12_000, 15_000];

/**
 * The Uber shape: the pin never moves, the world does. The circle is the whole
 * explanation of the radius — no words, just a shape over streets you know.
 */
export function VariantA() {
  const [center, setCenter] = useState<Coordinates>(LAHORE);
  const [radius, setRadius] = useState(DEFAULT_RADIUS_M);

  const circle = {
    center,
    radius,
    color: 'rgba(249,115,22,0.18)',
    lineColor: '#f97316',
    lineWidth: 2,
  };
  const camera = { coordinates: center, zoom: 12 };

  return (
    <View className="flex-1">
      <View className="flex-1">
        {Platform.OS === 'ios' ? (
          <AppleMaps.View
            style={{ flex: 1 }}
            cameraPosition={camera}
            circles={[circle]}
            onCameraMove={(event) => {
              if (event.coordinates) setCenter(event.coordinates as Coordinates);
            }}
          />
        ) : (
          <GoogleMaps.View
            style={{ flex: 1 }}
            cameraPosition={camera}
            circles={[circle]}
            onCameraMove={(event) => {
              if (event.coordinates) setCenter(event.coordinates as Coordinates);
            }}
          />
        )}

        {/* The pin is chrome, not a map object — it never moves. */}
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <View className="h-6 w-6 rounded-full border-4 border-white bg-primary-500 shadow" />
        </View>
      </View>

      <View className="gap-3 border-t border-gray-200 bg-white px-4 pb-8 pt-4">
        <Text variant="subheading" className="text-gray-900">
          Drag the map to your kitchen
        </Text>
        <Text variant="caption" className="text-gray-500">
          The circle is how far you will deliver — {formatRadius(radius)} from the pin.
        </Text>

        <View className="mt-1 flex-row flex-wrap gap-2">
          {STEPS.filter((m) => m >= MIN_RADIUS_M && m <= MAX_RADIUS_M).map((meters) => (
            <Pressable
              key={meters}
              onPress={() => setRadius(meters)}
              accessibilityRole="button"
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
      </View>
    </View>
  );
}
