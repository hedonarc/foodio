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

export const ORDER_PAYMENT_STATES = [
  'pending',
  'authorized',
  'captured',
  'voided',
  'refunded',
  'failed',
] as const;

export const orderPaymentStateSchema = z.enum(ORDER_PAYMENT_STATES);

/**
 * The money against an order, as its own record rather than a field on the
 * order — see the backend's ADR-0016. Cash never reaches `authorized`, because
 * there is nothing to hold.
 */
export const orderPaymentSchema = z.object({
  method: z.literal('cash_on_delivery'),
  state: orderPaymentStateSchema,
  amountMinor: z.number().int(),
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
  /**
   * Optional, and its absence means "we do not know" rather than "unpaid":
   * orders placed before order payments existed carry none, and the app must
   * not invent a state for them.
   */
  payment: orderPaymentSchema.optional(),
  /** Only on staff-scoped reads, so a rider can call about a wrong gate number. */
  customerPhone: z.string().optional(),
});

export const orderListSchema = z.array(orderSchema);

export type OrderPaymentState = z.infer<typeof orderPaymentStateSchema>;
export type OrderPayment = z.infer<typeof orderPaymentSchema>;
export type OrderLine = z.infer<typeof orderLineSchema>;
export type Order = z.infer<typeof orderSchema>;

/**
 * An order as it is submitted — the server owns id, status and placedAt, and
 * the payment, which it opens inside the order's own transaction. A client that
 * could state its own payment state could claim to have paid.
 */
export type NewOrder = Omit<Order, 'id' | 'status' | 'placedAt' | 'payment'>;

const TERMINAL: readonly OrderStatus[] = ['delivered', 'delivery_failed', 'rejected', 'cancelled'];

export const isTerminal = (status: OrderStatus): boolean => TERMINAL.includes(status);

/** Only before the kitchen starts. */
export const isCancellable = (status: OrderStatus): boolean =>
  status === 'placed' || status === 'accepted';
