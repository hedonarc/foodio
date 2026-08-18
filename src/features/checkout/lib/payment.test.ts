import { cashToCollect, customerPaymentKey } from './payment';

const cash = (state: 'pending' | 'captured' | 'voided' | 'refunded' | 'failed' | 'authorized') =>
  ({ method: 'cash_on_delivery', state, amountMinor: 66_000 }) as const;

describe('customerPaymentKey', () => {
  it('tells a customer to have the cash ready', () => {
    expect(customerPaymentKey(cash('pending'))).toBe('order.payment.dueOnDelivery');
  });

  it('confirms the money once it is taken', () => {
    expect(customerPaymentKey(cash('captured'))).toBe('order.payment.paid');
  });

  it('treats a void and a refund alike, because the customer is out nothing', () => {
    expect(customerPaymentKey(cash('voided'))).toBe('order.payment.notCharged');
    expect(customerPaymentKey(cash('refunded'))).toBe('order.payment.notCharged');
  });

  /** No record is not the same as unpaid, and inventing one would be a lie. */
  it('says nothing about an order that predates order payments', () => {
    expect(customerPaymentKey(undefined)).toBeNull();
  });
});

describe('cashToCollect', () => {
  it('gives the rider the amount to take at the door', () => {
    expect(cashToCollect({ status: 'out_for_delivery', payment: cash('pending') })).toBe(66_000);
  });

  it('stops asking once the money is in', () => {
    expect(cashToCollect({ status: 'delivered', payment: cash('captured') })).toBeNull();
  });

  /** A cancelled order is not a doorstep the rider is standing on. */
  it('stops asking on a terminal order even if the payment never settled', () => {
    expect(cashToCollect({ status: 'cancelled', payment: cash('pending') })).toBeNull();
  });

  it('says nothing about an order that predates order payments', () => {
    expect(cashToCollect({ status: 'out_for_delivery', payment: undefined })).toBeNull();
  });
});
