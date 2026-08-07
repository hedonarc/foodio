import type { Order, OrderStatus } from '@/features/checkout/types/order.types';

import {
  agingLevel,
  canFailDelivery,
  canReject,
  composeNote,
  groupQueue,
  legalTransitions,
  minutesSincePlaced,
  primaryTransition,
} from './workQueue';

const orderWith = (id: string, status: OrderStatus, placedAt: string): Order => ({
  id,
  restaurantId: 'rest-1',
  restaurantName: 'Taco Fiesta',
  currency: 'USD',
  status,
  placedAt,
  lines: [],
  subtotalMinor: 1000,
  deliveryFeeMinor: 100,
  totalMinor: 1100,
  address: {
    label: 'Home',
    line1: '1 Market St',
    city: 'San Francisco',
    postcode: '94103',
    latitude: 0,
    longitude: 0,
  },
  paymentMethod: 'cash_on_delivery',
});

/** Mirror of foodio-backend `order-status.ts` — the ground truth to stay inside. */
const BACKEND_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  placed: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['out_for_delivery'],
  out_for_delivery: ['delivered', 'delivery_failed'],
  delivered: [],
  delivery_failed: [],
  rejected: [],
  cancelled: [],
};

const ALL_STATUSES = Object.keys(BACKEND_TRANSITIONS) as OrderStatus[];

describe('legalTransitions', () => {
  it('never offers a transition the backend would refuse', () => {
    for (const role of ['kitchen', 'delivery'] as const) {
      for (const from of ALL_STATUSES) {
        for (const to of legalTransitions(role, from)) {
          expect(BACKEND_TRANSITIONS[from]).toContain(to);
        }
      }
    }
  });

  it('never offers the customer-only cancellation', () => {
    for (const role of ['kitchen', 'delivery'] as const) {
      for (const from of ALL_STATUSES) {
        expect(legalTransitions(role, from)).not.toContain('cancelled');
      }
    }
  });

  it('keeps each capability inside its place', () => {
    expect(legalTransitions('kitchen', 'ready')).toEqual([]);
    expect(legalTransitions('kitchen', 'out_for_delivery')).toEqual([]);
    expect(legalTransitions('delivery', 'placed')).toEqual([]);
    expect(legalTransitions('delivery', 'preparing')).toEqual([]);
  });
});

describe('primaryTransition', () => {
  it('walks the kitchen happy path', () => {
    expect(primaryTransition('kitchen', 'placed')).toBe('accepted');
    expect(primaryTransition('kitchen', 'accepted')).toBe('preparing');
    expect(primaryTransition('kitchen', 'preparing')).toBe('ready');
    expect(primaryTransition('kitchen', 'ready')).toBeNull();
  });

  it('walks the delivery happy path', () => {
    expect(primaryTransition('delivery', 'ready')).toBe('out_for_delivery');
    expect(primaryTransition('delivery', 'out_for_delivery')).toBe('delivered');
    expect(primaryTransition('delivery', 'delivered')).toBeNull();
  });

  it('never surfaces reject or fail as the obvious button', () => {
    for (const role of ['kitchen', 'delivery'] as const) {
      for (const from of ALL_STATUSES) {
        expect(['rejected', 'delivery_failed']).not.toContain(primaryTransition(role, from));
      }
    }
  });
});

describe('canReject / canFailDelivery', () => {
  it('only the kitchen rejects, and only an undecided order', () => {
    expect(canReject('kitchen', 'placed')).toBe(true);
    expect(canReject('kitchen', 'accepted')).toBe(false);
    expect(canReject('delivery', 'placed')).toBe(false);
  });

  it('only delivery fails, and only mid-flight', () => {
    expect(canFailDelivery('delivery', 'out_for_delivery')).toBe(true);
    expect(canFailDelivery('delivery', 'ready')).toBe(false);
    expect(canFailDelivery('kitchen', 'out_for_delivery')).toBe(false);
  });
});

describe('groupQueue', () => {
  const orders = [
    orderWith('a', 'preparing', '2026-08-08T10:05:00Z'),
    orderWith('b', 'placed', '2026-08-08T10:10:00Z'),
    orderWith('c', 'placed', '2026-08-08T10:00:00Z'),
    orderWith('d', 'accepted', '2026-08-08T10:02:00Z'),
    orderWith('e', 'ready', '2026-08-08T10:01:00Z'),
    orderWith('f', 'delivered', '2026-08-08T09:00:00Z'),
    orderWith('g', 'out_for_delivery', '2026-08-08T09:30:00Z'),
    orderWith('h', 'cancelled', '2026-08-08T09:45:00Z'),
  ];

  it('groups the kitchen by urgency, oldest first, terminal orders gone', () => {
    const sections = groupQueue('kitchen', orders);

    expect(sections.map((section) => section.key)).toEqual(['new', 'inKitchen', 'readyToLeave']);
    expect(sections[0]?.data.map((order) => order.id)).toEqual(['c', 'b']);
    expect(sections[1]?.data.map((order) => order.id)).toEqual(['d', 'a']);
    expect(sections[2]?.data.map((order) => order.id)).toEqual(['e']);
  });

  it('groups delivery into pick up and out with you only', () => {
    const sections = groupQueue('delivery', orders);

    expect(sections.map((section) => section.key)).toEqual(['toPickUp', 'outWithYou']);
    expect(sections[0]?.data.map((order) => order.id)).toEqual(['e']);
    expect(sections[1]?.data.map((order) => order.id)).toEqual(['g']);
  });

  it('drops empty groups instead of rendering hollow headers', () => {
    const sections = groupQueue('kitchen', [orderWith('a', 'ready', '2026-08-08T10:00:00Z')]);
    expect(sections.map((section) => section.key)).toEqual(['readyToLeave']);
  });
});

describe('aging', () => {
  const placedAt = '2026-08-08T10:00:00Z';
  const minutesLater = (minutes: number) => Date.parse(placedAt) + minutes * 60_000;

  it('floors elapsed minutes and never goes negative', () => {
    expect(minutesSincePlaced(placedAt, minutesLater(2) + 59_000)).toBe(2);
    expect(minutesSincePlaced(placedAt, minutesLater(-1))).toBe(0);
  });

  it('turns amber at 3 minutes and red at 6', () => {
    expect(agingLevel('placed', 2)).toBe('none');
    expect(agingLevel('placed', 3)).toBe('amber');
    expect(agingLevel('placed', 5)).toBe('amber');
    expect(agingLevel('placed', 6)).toBe('red');
    expect(agingLevel('placed', 45)).toBe('red');
  });

  it('never ages an order someone already owns', () => {
    expect(agingLevel('accepted', 45)).toBe('none');
    expect(agingLevel('preparing', 45)).toBe('none');
    expect(agingLevel('ready', 45)).toBe('none');
  });
});

describe('composeNote', () => {
  it('is just the reason when the note is empty', () => {
    expect(composeNote('Out of stock', '')).toBe('Out of stock');
    expect(composeNote('Out of stock', '   ')).toBe('Out of stock');
  });

  it('appends the trimmed detail after the reason', () => {
    expect(composeNote('No answer at the door', ' called twice ')).toBe(
      'No answer at the door — called twice',
    );
  });
});
