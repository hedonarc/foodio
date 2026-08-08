import type { Order, OrderStatus } from '@/features/checkout/types/order.types';
import { isTerminal } from '@/features/checkout/types/order.types';

export type WorkRole = 'kitchen' | 'delivery';

/**
 * Mirror of the backend's TRANSITIONS × requiredCapability, restricted to the
 * transitions each capability may cause — the app cannot invent a transition
 * the server would refuse. See foodio-backend `order-status.ts`.
 */
const STAFF_TRANSITIONS: Readonly<
  Record<WorkRole, Partial<Record<OrderStatus, readonly OrderStatus[]>>>
> = {
  kitchen: {
    placed: ['accepted', 'rejected'],
    accepted: ['preparing'],
    preparing: ['ready'],
  },
  delivery: {
    ready: ['out_for_delivery'],
    out_for_delivery: ['delivered', 'delivery_failed'],
  },
};

export const legalTransitions = (role: WorkRole, from: OrderStatus): readonly OrderStatus[] =>
  STAFF_TRANSITIONS[role][from] ?? [];

/** Rejecting and failing are rare and deliberate — never the one obvious button. */
const UNHAPPY: readonly OrderStatus[] = ['rejected', 'delivery_failed'];

/** The one obvious button per card, or null when this role has no move. */
export const primaryTransition = (role: WorkRole, from: OrderStatus): OrderStatus | null =>
  legalTransitions(role, from).find((to) => !UNHAPPY.includes(to)) ?? null;

export const canReject = (role: WorkRole, from: OrderStatus): boolean =>
  legalTransitions(role, from).includes('rejected');

export const canFailDelivery = (role: WorkRole, from: OrderStatus): boolean =>
  legalTransitions(role, from).includes('delivery_failed');

export type QueueGroupKey =
  'new' | 'inKitchen' | 'readyToLeave' | 'toPickUp' | 'outWithYou' | 'done';

const GROUPS: Readonly<
  Record<WorkRole, readonly { key: QueueGroupKey; statuses: readonly OrderStatus[] }[]>
> = {
  kitchen: [
    { key: 'new', statuses: ['placed'] },
    { key: 'inKitchen', statuses: ['accepted', 'preparing'] },
    { key: 'readyToLeave', statuses: ['ready'] },
  ],
  delivery: [
    { key: 'toPickUp', statuses: ['ready'] },
    { key: 'outWithYou', statuses: ['out_for_delivery'] },
  ],
};

export type QueueSection = { key: QueueGroupKey; data: Order[] };

/**
 * Fixed group order by urgency, oldest first within each — nothing quietly
 * rots at the bottom. Terminal orders leave the queue entirely.
 */
export function groupQueue(role: WorkRole, orders: readonly Order[]): QueueSection[] {
  return GROUPS[role]
    .map(({ key, statuses }) => ({
      key,
      data: orders
        .filter((order) => statuses.includes(order.status))
        .sort((a, b) => Date.parse(a.placedAt) - Date.parse(b.placedAt)),
    }))
    .filter((section) => section.data.length > 0);
}

export type QueueTab = 'active' | 'done';

/**
 * Newest first, unlike the live queue: a settled list is history, read from
 * the top, and nothing in it is waiting on anyone.
 */
export function doneQueue(orders: readonly Order[]): Order[] {
  return orders
    .filter((order) => isTerminal(order.status))
    .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt));
}

export const minutesSincePlaced = (placedAt: string, now: number): number =>
  Math.max(0, Math.floor((now - Date.parse(placedAt)) / 60_000));

export type AgingLevel = 'none' | 'amber' | 'red';

const AMBER_AFTER_MINUTES = 3;
const RED_AFTER_MINUTES = 6;

/** Only an undecided order ages — once accepted, the kitchen owns the clock. */
export function agingLevel(status: OrderStatus, minutes: number): AgingLevel {
  if (status !== 'placed') return 'none';
  if (minutes >= RED_AFTER_MINUTES) return 'red';
  if (minutes >= AMBER_AFTER_MINUTES) return 'amber';
  return 'none';
}

export const REJECT_REASONS = ['out_of_stock', 'closing', 'too_busy', 'other'] as const;
export const FAILURE_REASONS = ['no_answer', 'wrong_address', 'refused', 'other'] as const;

export type RejectReason = (typeof REJECT_REASONS)[number];
export type FailureReason = (typeof FAILURE_REASONS)[number];

/** The customer reads this on their timeline — reason first, detail after. */
export function composeNote(reasonLabel: string, detail: string): string {
  const trimmed = detail.trim();
  return trimmed ? `${reasonLabel} — ${trimmed}` : reasonLabel;
}

const ACTION_KEYS: Partial<Record<OrderStatus, string>> = {
  accepted: 'accept',
  preparing: 'startPreparing',
  ready: 'markReady',
  out_for_delivery: 'pickedUp',
  delivered: 'delivered',
};

/** i18n key under `work.actions` for the button that causes this transition. */
export const actionKey = (to: OrderStatus): string => ACTION_KEYS[to] ?? to;
