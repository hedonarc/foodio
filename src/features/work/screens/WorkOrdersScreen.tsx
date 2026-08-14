import { useState } from 'react';
import { Linking, RefreshControl, SectionList, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared';
import { Text } from '@/components/ui';
import type { OrderStatus } from '@/features/checkout/types/order.types';
import { IdentityChip } from '@/features/identity/components/IdentityChip';
import { ManageButton } from '@/features/manage';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';
import { useSessionStore } from '@/stores/session.store';

import { OrderCard } from '../components/OrderCard';
import { QueueTabs } from '../components/QueueTabs';
import { QueueToast } from '../components/QueueToast';
import { TransitionSheet } from '../components/TransitionSheet';
import { useNow } from '../hooks/useNow';
import { useOrderTransition } from '../hooks/useOrderTransition';
import { useRestaurantOrders } from '../hooks/useRestaurantOrders';
import { useTransientMessage } from '../hooks/useTransientMessage';
import type { QueueTab } from '../lib/workQueue';
import { doneQueue, FAILURE_REASONS, groupQueue, REJECT_REASONS } from '../lib/workQueue';

/** Minute badges only need to move about once a minute. */
const CLOCK_TICK_MS = 30_000;

type SheetState = { kind: 'reject' | 'deliver' | 'fail'; orderId: string } | null;

export function WorkOrdersScreen() {
  const { t } = useTranslation();
  const role = useSessionStore((state) => state.role);

  const workRole = role.kind === 'customer' ? null : role.kind;
  const restaurantId = role.kind === 'customer' ? undefined : role.restaurantId;

  const {
    data: orders,
    isPending,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRestaurantOrders(restaurantId);
  const { data: restaurants } = useRestaurants();
  const transition = useOrderTransition(restaurantId ?? '');
  const now = useNow(CLOCK_TICK_MS);
  const { message: toast, show: showToast } = useTransientMessage();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [tab, setTab] = useState<QueueTab>('active');

  const restaurantName =
    restaurants?.find((restaurant) => restaurant.id === restaurantId)?.name ?? '';

  const done = doneQueue(orders ?? []);
  const sections =
    tab === 'done'
      ? done.length > 0
        ? [{ key: 'done' as const, data: done }]
        : []
      : workRole
        ? groupQueue(workRole, orders ?? [])
        : [];

  const advance = (orderId: string, to: OrderStatus, note?: string) => {
    transition.mutate(
      { orderId, to, ...(note === undefined ? {} : { note }) },
      // The mutation hook already refetches; the toast says why the card moved.
      { onError: (cause) => showToast(toApiError(cause).message) },
    );
  };

  const openPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => showToast(t('work.callFailed')));
  };

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
        {role.kind === 'kitchen' ? <ManageButton /> : null}
        <IdentityChip />
      </View>

      <QueueTabs value={tab} onChange={setTab} />

      {/* Keyed siblings: these four share one slot, and swapping tabs swaps
          which occupies it. Without stable keys NativeWind tries to upgrade
          one component into another and serialises the props to warn — which
          walks React Navigation's throwing context getters and surfaces as a
          bogus "couldn't find a navigation context" render error. */}
      {isPending ? (
        <LoadingState key="loading" className="flex-1 items-center justify-center" />
      ) : null}
      {error ? (
        <ErrorState
          key="error"
          error={error}
          onRetry={refetch}
          className="flex-1 items-center justify-center px-8"
        />
      ) : null}
      {!isPending && !error && sections.length === 0 ? (
        <EmptyState
          key="empty"
          message={tab === 'done' ? t('work.noneDone') : t('work.noOrders')}
          className="flex-1 items-center justify-center px-8"
        />
      ) : null}

      {workRole && sections.length > 0 ? (
        <SectionList
          key="queue"
          sections={sections}
          keyExtractor={(order) => order.id}
          stickySectionHeadersEnabled={false}
          contentContainerClassName="px-4 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={() => void refetch()}
            />
          }
          onEndReached={() => {
            if (hasNextPage) void fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <LoadingState /> : null}
          renderSectionHeader={({ section }) => (
            <View className="flex-row items-center pb-2 pt-4">
              <Text variant="label" className="text-gray-500">
                {t(`work.groups.${section.key}`)}
              </Text>
              <Text variant="label" className="ml-2 text-gray-400">
                {section.data.length}
              </Text>
            </View>
          )}
          renderItem={({ item: order }) => (
            <OrderCard
              order={order}
              role={workRole}
              now={now}
              expanded={expandedId === order.id}
              isPending={transition.isPending && transition.variables?.orderId === order.id}
              onToggle={() => setExpandedId((current) => (current === order.id ? null : order.id))}
              onAdvance={(to) =>
                to === 'delivered'
                  ? setSheet({ kind: 'deliver', orderId: order.id })
                  : advance(order.id, to)
              }
              onReject={() => setSheet({ kind: 'reject', orderId: order.id })}
              onDeliver={() => setSheet({ kind: 'deliver', orderId: order.id })}
              onFailDelivery={() => setSheet({ kind: 'fail', orderId: order.id })}
              onCall={openPhone}
            />
          )}
        />
      ) : null}

      <TransitionSheet
        visible={sheet?.kind === 'reject'}
        title={t('work.reject.title')}
        reasons={REJECT_REASONS}
        labelForReason={(reason) => t(`work.reject.reasons.${reason}`)}
        confirmLabel={t('work.actions.reject')}
        onConfirm={(note) => {
          if (sheet) advance(sheet.orderId, 'rejected', note);
          setSheet(null);
        }}
        onCancel={() => setSheet(null)}
      />

      <TransitionSheet
        visible={sheet?.kind === 'deliver'}
        title={t('work.deliver.title')}
        message={t('work.deliver.message')}
        confirmLabel={t('work.actions.delivered')}
        onConfirm={() => {
          if (sheet) advance(sheet.orderId, 'delivered');
          setSheet(null);
        }}
        onCancel={() => setSheet(null)}
      />

      <TransitionSheet
        visible={sheet?.kind === 'fail'}
        title={t('work.fail.title')}
        reasons={FAILURE_REASONS}
        labelForReason={(reason) => t(`work.fail.reasons.${reason}`)}
        confirmLabel={t('work.actions.couldNotDeliver')}
        onConfirm={(note) => {
          if (sheet) advance(sheet.orderId, 'delivery_failed', note);
          setSheet(null);
        }}
        onCancel={() => setSheet(null)}
      />

      <QueueToast message={toast} />
    </SafeAreaView>
  );
}
