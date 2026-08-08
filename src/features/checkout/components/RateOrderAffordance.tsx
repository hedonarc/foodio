import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Button, Text } from '@/components/ui';
import { useIsOrderRated } from '@/stores/ratedOrders.store';
import { colors } from '@/theme';

import { RateOrderSheet } from './RateOrderSheet';

type RateOrderAffordanceProps = {
  orderId: string;
  restaurantName: string;
  /** `button` on the order status screen, `row` inside an orders-list row. */
  variant: 'button' | 'row';
};

/**
 * A delivered order's way in to rating it. Once rated — by this session or
 * discovered via the server's 409 — it settles into a quiet "Rated" state.
 */
export function RateOrderAffordance({
  orderId,
  restaurantName,
  variant,
}: RateOrderAffordanceProps) {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const isRated = useIsOrderRated(orderId);

  if (isRated) {
    return (
      <View className={variant === 'button' ? 'mt-6 flex-row justify-center' : 'mt-2 flex-row'}>
        <View className="flex-row items-center">
          <Ionicons name="star" size={14} color={colors.warning[500]} />
          <Text variant="caption" className="ml-1.5 text-gray-400">
            {t('review.rated')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      {variant === 'button' ? (
        <Button onPress={() => setSheetOpen(true)} className="mt-6">
          {t('review.rateOrder')}
        </Button>
      ) : (
        <Pressable
          onPress={() => setSheetOpen(true)}
          accessibilityRole="button"
          className="mt-2 flex-row items-center self-start rounded-full bg-primary-50 px-3 py-1.5 active:bg-primary-100"
        >
          <Ionicons name="star-outline" size={14} color={colors.primary[700]} />
          <Text variant="label" className="ml-1.5 text-primary-700">
            {t('review.rateOrder')}
          </Text>
        </Pressable>
      )}

      <RateOrderSheet
        visible={sheetOpen}
        orderId={orderId}
        restaurantName={restaurantName}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
