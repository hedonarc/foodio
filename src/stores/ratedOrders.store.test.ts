import { useRatedOrdersStore } from './ratedOrders.store';

describe('ratedOrders store', () => {
  beforeEach(() => useRatedOrdersStore.setState({ ratedOrderIds: {} }));

  it('starts with nothing rated', () => {
    expect(useRatedOrdersStore.getState().ratedOrderIds['order-1']).toBeUndefined();
  });

  it('remembers a rated order', () => {
    useRatedOrdersStore.getState().markRated('order-1');
    expect(useRatedOrdersStore.getState().ratedOrderIds['order-1']).toBe(true);
    expect(useRatedOrdersStore.getState().ratedOrderIds['order-2']).toBeUndefined();
  });

  it('marking twice stays marked', () => {
    useRatedOrdersStore.getState().markRated('order-1');
    useRatedOrdersStore.getState().markRated('order-1');
    expect(useRatedOrdersStore.getState().ratedOrderIds['order-1']).toBe(true);
  });
});
