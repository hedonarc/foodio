import { apiClient } from '@/api/client';
import type { Page } from '@/api/page';
import { parsePage } from '@/api/page';
import { parseResponse } from '@/api/parse';

import type { NewOrder, Order } from '../types/order.types';
import { orderListSchema, orderSchema } from '../types/order.types';

/**
 * `idempotencyKey` must be generated once at the moment the customer forms
 * the intent to order and reused for every retry of that same attempt — see
 * backend ADR-0011. A fresh key here would defeat the whole mechanism.
 */
export async function placeOrder(order: NewOrder, idempotencyKey: string): Promise<Order> {
  const { data } = await apiClient.post<unknown>('/orders', order, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return parseResponse(orderSchema, data, 'POST /orders');
}

export async function fetchOrder(orderId: string): Promise<Order> {
  const endpoint = `/orders/${orderId}`;
  const { data } = await apiClient.get<unknown>(endpoint);
  return parseResponse(orderSchema, data, `GET ${endpoint}`);
}

export async function fetchOrdersPage(cursor?: string): Promise<Page<Order>> {
  const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
  const { data, headers } = await apiClient.get<unknown>(
    `/orders?_sort=placedAt&_order=desc${cursorParam}`,
  );
  return parsePage(orderListSchema, data, headers['x-next-cursor'], 'GET /orders');
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const endpoint = `/orders/${orderId}`;
  const { data } = await apiClient.patch<unknown>(endpoint, { status: 'cancelled' });
  return parseResponse(orderSchema, data, `PATCH ${endpoint}`);
}
