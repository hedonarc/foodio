/** PROTOTYPE — throwaway. Variant C: pick the areas; the radius is derived. */
import { useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';

import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { colors } from '@/theme';
import type { Coordinates } from '@/utils/distance';
import { distanceBetween } from '@/utils/distance';

import { formatRadius, LAHORE, LANDMARKS, MAX_RADIUS_M, MIN_RADIUS_M } from './shared';

/**
 * The owner never sees a number. They tap the areas they want to deliver to and
 * the radius is whatever covers them — because a circle cannot exclude anywhere,
 * ticking one far area drags several near ones in, which is the honest lesson
 * this variant teaches about radius-as-a-model.
 */
export function VariantC() {
  const center: Coordinates = LAHORE;
  const [wanted, setWanted] = useState<string[]>(['Gulberg']);

  const distances = LANDMARKS.map((l) => ({ ...l, meters: distanceBetween(center, l.at) }));

  const needed = distances
    .filter((l) => wanted.includes(l.name))
    .reduce((max, l) => Math.max(max, l.meters), MIN_RADIUS_M);

  const radius = Math.min(MAX_RADIUS_M, Math.ceil(needed / 100) * 100);
  const included = distances.filter((l) => l.meters <= radius);
  const dragged = included.filter((l) => !wanted.includes(l.name));

  const toggle = (name: string) =>
    setWanted((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name],
    );

  const circle = {
    center,
    radius,
    color: 'rgba(249,115,22,0.18)',
    lineColor: '#f97316',
    lineWidth: 2,
  };

  return (
    <View className="flex-1 bg-white">
      <View className="h-56">
        {Platform.OS === 'ios' ? (
          <AppleMaps.View
            style={{ flex: 1 }}
            cameraPosition={{ coordinates: center, zoom: 10 }}
            circles={[circle]}
          />
        ) : (
          <GoogleMaps.View
            style={{ flex: 1 }}
            cameraPosition={{ coordinates: center, zoom: 10 }}
            circles={[circle]}
          />
        )}
      </View>

      <ScrollView contentContainerClassName="gap-1 px-4 pb-10 pt-4">
        <Text variant="subheading" className="text-gray-900">
          Where will you deliver?
        </Text>
        <Text variant="caption" className="mb-2 text-gray-500">
          Pick the areas. We work out the distance — currently {formatRadius(radius)}.
        </Text>

        {distances
          .slice()
          .sort((a, b) => a.meters - b.meters)
          .map((l) => {
            const chosen = wanted.includes(l.name);
            const inside = l.meters <= radius;

            return (
              <Pressable
                key={l.name}
                onPress={() => toggle(l.name)}
                accessibilityRole="button"
                accessibilityState={{ selected: chosen }}
                className="flex-row items-center justify-between border-b border-gray-100 py-3"
              >
                <View className="flex-1">
                  <Text variant="bodyMedium" className={inside ? 'text-gray-900' : 'text-gray-400'}>
                    {l.name}
                  </Text>
                  <Text variant="caption" className="text-gray-400">
                    {formatRadius(Math.round(l.meters))} away
                    {!chosen && inside ? ' · included anyway' : ''}
                  </Text>
                </View>

                <Ionicons
                  name={
                    chosen ? 'checkmark-circle' : inside ? 'ellipse-outline' : 'ellipse-outline'
                  }
                  size={22}
                  color={chosen ? colors.primary[500] : colors.gray[300]}
                />
              </Pressable>
            );
          })}

        {dragged.length > 0 ? (
          <Text variant="caption" className="mt-3 text-warning-700">
            A circle cannot skip anywhere: reaching your picks also covers{' '}
            {dragged.map((l) => l.name).join(', ')}.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
