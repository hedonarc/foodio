import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Button, Text } from '@/components/ui';
import type { Order, OrderStatus } from '@/features/checkout/types/order.types';
import { isTerminal } from '@/features/checkout/types/order.types';
import { cn } from '@/lib/cn';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';
import { formatDate } from '@/utils/date';

import type { AgingLevel, WorkRole } from '../lib/workQueue';
import {
  actionKey,
  agingLevel,
  canFailDelivery,
  canReject,
  minutesSincePlaced,
  primaryTransition,
} from '../lib/workQueue';

const CARD_STYLES: Record<AgingLevel, string> = {
  none: 'border-gray-100',
  amber: 'border-warning-500',
  red: 'border-red-500',
};

const BADGE_STYLES: Record<AgingLevel, string> = {
  none: 'bg-gray-100',
  amber: 'bg-warning-100',
  red: 'bg-red-100',
};

const BADGE_TEXT_STYLES: Record<AgingLevel, string> = {
  none: 'text-gray-600',
  amber: 'text-warning-700',
  red: 'text-red-700',
};

type OrderCardProps = {
  order: Order;
  role: WorkRole;
  now: number;
  expanded: boolean;
  isPending: boolean;
  onToggle: () => void;
  /** Happy-path taps go straight through; the rest via the sheets below. */
  onAdvance: (to: OrderStatus) => void;
  onReject: () => void;
  onDeliver: () => void;
  onFailDelivery: () => void;
  onCall: (phone: string) => void;
};

/**
 * Tap expands in place — a kitchen tablet is used standing up, mid-task, so
 * detail never navigates away from the queue.
 */
export function OrderCard({
  order,
  role,
  now,
  expanded,
  isPending,
  onToggle,
  onAdvance,
  onReject,
  onDeliver,
  onFailDelivery,
  onCall,
}: OrderCardProps) {
  const { t, i18n } = useTranslation();

  const minutes = minutesSincePlaced(order.placedAt, now);
  const aging = agingLevel(order.status, minutes);
  const primary = primaryTransition(role, order.status);
  const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  // A settled order stops being urgent: minutes since placed would only grow
  // into nonsense ("4320 min"), so history reads as a date instead.
  const settled = isTerminal(order.status);

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      className={cn('mb-3 rounded-2xl border bg-white p-4', CARD_STYLES[aging])}
    >
      <View className="flex-row items-center">
        <View className={cn('rounded-full px-2.5 py-1', BADGE_STYLES[aging])}>
          <Text variant="label" className={BADGE_TEXT_STYLES[aging]}>
            {settled
              ? formatDate(order.placedAt, i18n.language)
              : t('work.minutes', { count: minutes })}
          </Text>
        </View>
        <Text variant="bodyMedium" className="ml-3 flex-1 text-gray-900" numberOfLines={1}>
          {t(`order.status.${order.status}`)}
        </Text>
        <Text variant="bodyMedium" className="text-gray-900">
          {formatMoney(order.totalMinor, order.currency, i18n.language)}
        </Text>
      </View>

      <Text variant="caption" className="mt-2 text-gray-500">
        {t('work.itemCount', { count: itemCount })}
      </Text>

      {expanded ? <OrderDetail order={order} role={role} onCall={onCall} /> : null}

      {expanded && canReject(role, order.status) ? (
        <Button variant="secondary" onPress={onReject} disabled={isPending} className="mt-4">
          {t('work.actions.reject')}
        </Button>
      ) : null}

      {order.status === 'out_for_delivery' && role === 'delivery' ? (
        <View className="mt-4 flex-row gap-3">
          <Button
            variant="secondary"
            onPress={onFailDelivery}
            disabled={isPending || !canFailDelivery(role, order.status)}
            className="flex-1"
          >
            {t('work.actions.couldNotDeliver')}
          </Button>
          <Button onPress={onDeliver} disabled={isPending} className="flex-1">
            {t('work.actions.delivered')}
          </Button>
        </View>
      ) : primary ? (
        <Button onPress={() => onAdvance(primary)} disabled={isPending} className="mt-4">
          {t(`work.actions.${actionKey(primary)}`)}
        </Button>
      ) : null}
    </Pressable>
  );
}

function OrderDetail({
  order,
  role,
  onCall,
}: {
  order: Order;
  role: WorkRole;
  onCall: (phone: string) => void;
}) {
  const { t } = useTranslation();

  // In-flight orders only — a settled order never renders a number.
  const phone = role === 'delivery' && !isTerminal(order.status) ? order.customerPhone : undefined;

  return (
    <View className="mt-3 border-t border-gray-100 pt-3">
      {order.lines.map((line, index) => (
        <View key={`${line.menuItemId}-${index}`} className="mt-1">
          <Text variant="caption" className="text-gray-700">
            {line.quantity} × {line.name}
          </Text>
          {line.instruction ? (
            <Text variant="caption" className="text-gray-400">
              {line.instruction}
            </Text>
          ) : null}
        </View>
      ))}

      <View className="mt-3 flex-row items-start">
        <Ionicons name="location-outline" size={13} color={colors.gray[400]} />
        <View className="ml-1.5 flex-1">
          <Text variant="caption" className="text-gray-600">
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}
          </Text>
          {order.address.notes ? (
            <Text variant="caption" className="text-gray-400">
              {order.address.notes}
            </Text>
          ) : null}
        </View>
      </View>

      {phone ? (
        <Pressable
          onPress={() => onCall(phone)}
          accessibilityRole="button"
          className="mt-3 flex-row items-center self-start rounded-full bg-gray-100 px-3 py-2 active:bg-gray-200"
        >
          <Ionicons name="call-outline" size={14} color={colors.gray[700]} />
          <Text variant="label" className="ml-1.5 text-gray-700">
            {t('work.callCustomer')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
