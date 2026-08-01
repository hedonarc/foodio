import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

import type { OrderStatus } from '../types/order.types';

/** The happy path. Rejected and cancelled leave it rather than extend it. */
const PROGRESSION: readonly OrderStatus[] = [
  'placed',
  'accepted',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
];

type OrderStatusTimelineProps = {
  status: OrderStatus;
};

export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  const { t } = useTranslation();

  if (status === 'rejected' || status === 'cancelled') {
    return (
      <View className="mt-6 flex-row items-center rounded-2xl bg-gray-50 p-4">
        <Ionicons name="close-circle-outline" size={18} color={colors.error[500]} />
        <Text variant="caption" className="ml-2 flex-1 text-gray-600">
          {t(`order.ended.${status}`)}
        </Text>
      </View>
    );
  }

  const reached = PROGRESSION.indexOf(status);

  return (
    <View className="mt-6 gap-3">
      {PROGRESSION.map((step, index) => {
        const done = index <= reached;

        return (
          <View key={step} className="flex-row items-center">
            <Ionicons
              name={done ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={done ? colors.success[500] : colors.gray[300]}
            />
            <Text
              variant={index === reached ? 'bodyMedium' : 'body'}
              className={done ? 'ml-3 text-gray-900' : 'ml-3 text-gray-400'}
            >
              {t(`order.status.${step}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
