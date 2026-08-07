import { getActiveAddressId, setActiveAddressId } from '@/services/storage';

import { useActiveAddressStore } from './activeAddress.store';

jest.mock('@/services/storage', () => ({
  getActiveAddressId: jest.fn(),
  setActiveAddressId: jest.fn(),
}));

const mockedGet = jest.mocked(getActiveAddressId);
const mockedSet = jest.mocked(setActiveAddressId);

const state = () => useActiveAddressStore.getState();

beforeEach(() => {
  useActiveAddressStore.setState({ activeAddressId: null, isHydrated: false });
  mockedGet.mockReset();
  mockedSet.mockReset().mockResolvedValue();
});

describe('selectAddress', () => {
  it('sets the id in memory and persists it', () => {
    state().selectAddress('addr-1');

    expect(state().activeAddressId).toBe('addr-1');
    expect(mockedSet).toHaveBeenCalledWith('addr-1');
  });

  it('replaces a previous selection', () => {
    state().selectAddress('addr-1');
    state().selectAddress('addr-2');

    expect(state().activeAddressId).toBe('addr-2');
  });
});

describe('hydrate', () => {
  it('restores a persisted selection', async () => {
    mockedGet.mockResolvedValue('addr-1');

    await state().hydrate();

    expect(state().activeAddressId).toBe('addr-1');
    expect(state().isHydrated).toBe(true);
  });

  it('leaves nothing selected when nothing was persisted', async () => {
    mockedGet.mockResolvedValue(null);

    await state().hydrate();

    expect(state().activeAddressId).toBeNull();
    expect(state().isHydrated).toBe(true);
  });
});
