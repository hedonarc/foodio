import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { useActiveAddress } from '@/features/checkout/hooks/useActiveAddress';
import { colors } from '@/theme';

import { deliveryReach, toKm } from '../lib/deliveryReach';
import type { Restaurant } from '../types/restaurant.types';

type RestaurantReachProps = {
  restaurant: Restaurant;
};

/**
 * The one line the page with the Add buttons was missing: whether this
 * Restaurant's Delivery Area reaches the customer at all. Home cards said
 * *Out of delivery range*; here a customer could fill a Cart and learn it at
 * checkout (#195).
 *
 * Nothing without an address — checkout asks for one, and a guess would be
 * wrong more often than helpful.
 */
export function RestaurantReach({ restaurant }: RestaurantReachProps) {
  const { t } = useTranslation();
  const { address } = useActiveAddress();

  if (!address) return null;

  const reach = deliveryReach(address, restaurant);
  const km = toKm(reach.distanceMeters);

  return (
    <View className="mt-3 flex-row items-start">
      <Ionicons
        name={reach.deliverable ? 'checkmark-circle' : 'alert-circle'}
        size={15}
        color={reach.deliverable ? colors.success[500] : colors.warning[500]}
        className="mt-0.5"
      />
      <Text
        variant="caption"
        className={`ml-1.5 flex-1 font-medium ${reach.deliverable ? 'text-gray-600' : 'text-warning-700'}`}
      >
        {reach.deliverable
          ? t('restaurant.deliversTo', { label: address.label, km })
          : t('restaurant.doesNotDeliverTo', {
              label: address.label,
              km,
              radius: toKm(reach.radiusMeters),
            })}
      </Text>
    </View>
  );
}
