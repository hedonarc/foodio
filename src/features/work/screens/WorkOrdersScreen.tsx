import { ScrollView, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/shared';
import { Text } from '@/components/ui';
import type { Order, OrderStatus } from '@/features/checkout/types/order.types';
import { IdentityChip } from '@/features/identity/components/IdentityChip';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';
import { formatDate } from '@/utils/date';

import { useRestaurantOrders } from '../hooks/useRestaurantOrders';

/** Delivery staff care about the tail of the order's life, not the kitchen's. */
const DELIVERY_STATUSES: OrderStatus[] = ['ready', 'out_for_delivery', 'delivered'];

/**
 * Read-only for now. Advancing an Order through its statuses is a real
 * workflow with real decisions behind it, and it has not been charted —
 * showing the queue honestly beats inventing one.
 */
export function WorkOrdersScreen() {
  const { t, i18n } = useTranslation();
  const role = useSessionStore((state) => state.role);

  const restaurantId = role.kind === 'customer' ? undefined : role.restaurantId;
  const { data: orders, isPending, error, refetch } = useRestaurantOrders(restaurantId);
  const { data: restaurants } = useRestaurants();

  const restaurantName =
    restaurants?.find((restaurant) => restaurant.id === restaurantId)?.name ?? '';

  const visible =
    role.kind === 'delivery'
      ? (orders ?? []).filter((order) => DELIVERY_STATUSES.includes(order.status))
      : (orders ?? []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <View className="flex-1">
          <Text variant="subheading" className="text-gray-900" numberOfLines={1}>
            {restaurantName}
          </Text>
          <Text variant="caption" className="mt-0.5 text-gray-500">
            {role.kind === 'delivery' ? t('work.deliverySubtitle') : t('work.kitchenSubtitle')}
          </Text>
        </View>
        <IdentityChip />
      </View>

      {isPending ? <LoadingState className="flex-1 items-center justify-center" /> : null}
      {error ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          className="flex-1 items-center justify-center px-8"
        />
      ) : null}
      {!isPending && !error && visible.length === 0 ? (
        <EmptyState
          message={t('work.noOrders')}
          className="flex-1 items-center justify-center px-8"
        />
      ) : null}

      {visible.length > 0 ? (
        <ScrollView contentContainerClassName="px-4 pb-8">
          {visible.map((order) => (
            <OrderRow key={order.id} order={order} language={i18n.language} />
          ))}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function OrderRow({ order, language }: { order: Order; language: string }) {
  const { t } = useTranslation();

  return (
    <View className="mb-3 rounded-2xl border border-gray-100 p-4">
      <View className="flex-row items-center">
        <Text variant="bodyMedium" className="flex-1 text-gray-900">
          {t(`order.status.${order.status}`)}
        </Text>
        <Text variant="bodyMedium" className="text-gray-900">
          {formatMoney(order.totalMinor, order.currency, language)}
        </Text>
      </View>

      {order.lines.map((line, index) => (
        <View key={`${line.menuItemId}-${index}`} className="mt-2">
          <Text variant="caption" className="text-gray-600">
            {line.quantity} × {line.name}
          </Text>
          {line.instruction ? (
            <Text variant="caption" className="text-gray-400">
              {line.instruction}
            </Text>
          ) : null}
        </View>
      ))}

      <View className="mt-3 flex-row items-center">
        <Ionicons name="time-outline" size={13} color={colors.gray[400]} />
        <Text variant="caption" className="ml-1.5 text-gray-400">
          {formatDate(order.placedAt, language)}
        </Text>
      </View>
    </View>
  );
}
