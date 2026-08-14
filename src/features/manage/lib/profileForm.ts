import type { Restaurant } from '@/features/restaurants';

import type { ProfileFormValues } from '../types/profile.types';

/** Minor units are the wire format; rupees are what an owner types. */
const toMajor = (minor: number): string => (minor / 100).toFixed(2);
const toMinor = (major: string): number => Math.round(Number(major) * 100);

export function profileDefaults(restaurant: Restaurant): ProfileFormValues {
  return {
    name: restaurant.name,
    description: restaurant.description,
    address: restaurant.address,
    cuisines: restaurant.cuisines.join(', '),
    deliveryFee: toMajor(restaurant.deliveryFeeMinor),
    minMinutes: String(restaurant.deliveryEstimate.minMinutes),
    maxMinutes: String(restaurant.deliveryEstimate.maxMinutes),
  };
}

export function profilePatch(values: ProfileFormValues) {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    address: values.address.trim(),
    // Split on commas and drop the blanks a trailing one leaves behind.
    cuisines: values.cuisines
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0),
    deliveryFeeMinor: toMinor(values.deliveryFee),
    deliveryEstimate: {
      minMinutes: Number(values.minMinutes),
      maxMinutes: Number(values.maxMinutes),
    },
  };
}
