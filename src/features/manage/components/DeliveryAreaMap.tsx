import { Platform, View } from 'react-native';

import { AppleMaps, GoogleMaps } from 'expo-maps';

import { colors } from '@/theme';
import type { Coordinates } from '@/utils/distance';

type DeliveryAreaMapProps = {
  /** Where the pin is right now — the circle follows this, drag by drag. */
  point: Coordinates;
  /**
   * Drives the camera, and so changes only deliberately: prefilling from GPS,
   * or fitting a newly chosen radius. Driving it from the drag would fight the
   * gesture that produced it.
   */
  camera: { center: Coordinates; zoom: number };
  radiusMeters: number;
  onMove: (center: Coordinates) => void;
};

/**
 * The map, its circle, and the pin that never moves.
 *
 * The pin is chrome rather than a map object: it sits dead centre, and the
 * world moves under it. That makes placing yourself a gesture instead of a
 * form field, which is the whole of t8's answer.
 */
export function DeliveryAreaMap({ point, camera, radiusMeters, onMove }: DeliveryAreaMapProps) {
  const circles = [
    {
      center: point,
      radius: radiusMeters,
      color: 'rgba(249,115,22,0.18)',
      lineColor: colors.primary[500],
      lineWidth: 2,
    },
  ];

  const cameraPosition = { coordinates: camera.center, zoom: camera.zoom };

  // expo-maps reports both coordinates as optional; a half-move is not a move.
  const report = (coordinates: { latitude?: number; longitude?: number }) => {
    const { latitude, longitude } = coordinates;
    if (latitude === undefined || longitude === undefined) return;
    onMove({ latitude, longitude });
  };

  return (
    <View className="flex-1">
      {Platform.OS === 'ios' ? (
        <AppleMaps.View
          style={{ flex: 1 }}
          cameraPosition={cameraPosition}
          circles={circles}
          onCameraMove={(event) => report(event.coordinates)}
        />
      ) : (
        <GoogleMaps.View
          style={{ flex: 1 }}
          cameraPosition={cameraPosition}
          circles={circles}
          onCameraMove={(event) => report(event.coordinates)}
        />
      )}

      <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
        <View className="h-6 w-6 rounded-full border-4 border-white bg-primary-500 shadow" />
      </View>
    </View>
  );
}
