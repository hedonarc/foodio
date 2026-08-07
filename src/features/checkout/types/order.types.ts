import { z } from 'zod';

import { deliveryAddressSchema } from './address.types';

/**
 * No "finding a courier" stage — the restaurant delivers its own orders, so
 * there is nobody to search for. See docs/adr/0003.
 *
 * `delivery_failed` is the cash-on-delivery failure mode a card market never
 * has — nobody answered the door — see the backend's ADR-0009.
 */
export const ORDER_STATUSES = [
  'placed',
  'accepted',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'delivery_failed',
  'rejected',
  'cancelled',
] as const;

export const orderStatusSchema = z.enum(ORDER_STATUSES);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

/** The amount charged at the time, never the menu item's current price. */
export const orderLineSchema = z.object({
  menuItemId: z.string(),
  name: z.string(),
  image: z.string(),
  unitPriceMinor: z.number().int(),
  quantity: z.number().int().positive(),
  /** Optional: orders placed before instructions existed carry none. */
  instruction: z.string().optional(),
});

export const orderSchema = z.object({
  /** json-server assigns a number; every caller wants a string. */
  id: z.coerce.string(),
  restaurantId: z.string(),
  restaurantName: z.string(),
  currency: z.string(),
  status: orderStatusSchema,
  placedAt: z.string(),
  lines: z.array(orderLineSchema),
  subtotalMinor: z.number().int(),
  deliveryFeeMinor: z.number().int(),
  totalMinor: z.number().int(),
  address: deliveryAddressSchema,
  paymentMethod: z.literal('cash_on_delivery'),
});

export const orderListSchema = z.array(orderSchema);

export type OrderLine = z.infer<typeof orderLineSchema>;
export type Order = z.infer<typeof orderSchema>;

/** An order as it is submitted — the server owns id, status and placedAt. */
export type NewOrder = Omit<Order, 'id' | 'status' | 'placedAt'>;

const TERMINAL: readonly OrderStatus[] = ['delivered', 'delivery_failed', 'rejected', 'cancelled'];

export const isTerminal = (status: OrderStatus): boolean => TERMINAL.includes(status);

/** Only before the kitchen starts. */
export const isCancellable = (status: OrderStatus): boolean =>
  status === 'placed' || status === 'accepted';
