import { apiClient } from '@/api/client';
import { parseResponse } from '@/api/parse';

import type { NewOrder, Order } from '../types/order.types';
import { orderListSchema, orderSchema } from '../types/order.types';

export async function placeOrder(order: NewOrder): Promise<Order> {
  const { data } = await apiClient.post<unknown>('/orders', order);
  return parseResponse(orderSchema, data, 'POST /orders');
}

export async function fetchOrder(orderId: string): Promise<Order> {
  const endpoint = `/orders/${orderId}`;
  const { data } = await apiClient.get<unknown>(endpoint);
  return parseResponse(orderSchema, data, `GET ${endpoint}`);
}

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<unknown>('/orders?_sort=placedAt&_order=desc');
  return parseResponse(orderListSchema, data, 'GET /orders');
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const endpoint = `/orders/${orderId}`;
  const { data } = await apiClient.patch<unknown>(endpoint, { status: 'cancelled' });
  return parseResponse(orderSchema, data, `PATCH ${endpoint}`);
}
