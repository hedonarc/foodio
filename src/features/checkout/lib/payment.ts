import type { Order, OrderPayment } from '../types/order.types';
import { isTerminal } from '../types/order.types';

/**
 * What to tell the customer about their own money, or nothing.
 *
 * `null` where the order carries no payment at all — those were placed before
 * order payments existed, and "we have no record" is not the same as "unpaid".
 * Saying nothing is the only honest option.
 */
export function customerPaymentKey(payment: OrderPayment | undefined): string | null {
  if (payment === undefined) return null;

  switch (payment.state) {
    case 'pending':
      return 'order.payment.dueOnDelivery';
    case 'captured':
      return 'order.payment.paid';
    case 'voided':
    case 'refunded':
      return 'order.payment.notCharged';
    case 'failed':
      return 'order.payment.failed';
    // Cash never holds money, so this is unreachable until card arrives.
    case 'authorized':
      return 'order.payment.held';
  }
}

/**
 * Whether the rider still has cash to take at the door.
 *
 * Cash captures on delivery, so a pending payment on a live order is money the
 * rider is carrying responsibility for. An order with no payment record says
 * nothing — the rider is told the total either way, and a guessed prompt on an
 * old order is worse than none.
 */
export function cashToCollect(order: Pick<Order, 'status' | 'payment'>): number | null {
  const { payment } = order;
  if (payment === undefined) return null;
  if (payment.method !== 'cash_on_delivery' || payment.state !== 'pending') return null;

  return isTerminal(order.status) ? null : payment.amountMinor;
}
