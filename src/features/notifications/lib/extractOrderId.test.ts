import { extractOrderId } from './extractOrderId';

describe('extractOrderId', () => {
  it('returns the orderId from a well-formed payload', () => {
    expect(extractOrderId({ orderId: 'order-1', status: 'accepted' })).toBe('order-1');
  });

  it('returns null when orderId is missing', () => {
    expect(extractOrderId({ status: 'accepted' })).toBeNull();
  });

  it('returns null when orderId is not a string', () => {
    expect(extractOrderId({ orderId: 42 })).toBeNull();
  });

  it('returns null when orderId is an empty string', () => {
    expect(extractOrderId({ orderId: '' })).toBeNull();
  });

  it('returns null for null data', () => {
    expect(extractOrderId(null)).toBeNull();
  });

  it('returns null for undefined data', () => {
    expect(extractOrderId(undefined)).toBeNull();
  });

  it('returns null for non-object data', () => {
    expect(extractOrderId('order-1')).toBeNull();
    expect(extractOrderId(42)).toBeNull();
  });
});
