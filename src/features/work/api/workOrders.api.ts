import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';
import type { Order, OrderStatus } from '@/features/checkout/types/order.types';
import { orderSchema } from '@/features/checkout/types/order.types';

export type OrderTransition = {
  orderId: string;
  to: OrderStatus;
  /** Why the kitchen said no, or why the door went unanswered. */
  note?: string;
};

/**
 * Same PATCH the customer's cancel uses; the server enforces legality and
 * treats a same-status repeat as `unchanged`, so a double tap is safe.
 */
export async function transitionOrder({ orderId, to, note }: OrderTransition): Promise<Order> {
  const endpoint = `/orders/${orderId}`;
  const body = note === undefined ? { status: to } : { status: to, note };
  const { data } = await apiClient.patch<unknown>(endpoint, body);
  return parseResponse(orderSchema, data, `PATCH ${endpoint}`);
}
