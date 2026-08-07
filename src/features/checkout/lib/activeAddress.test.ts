import type { SavedAddress } from '../types/address.types';

import { resolveActiveAddress } from './activeAddress';

const address = (overrides: Partial<SavedAddress> = {}): SavedAddress => ({
  id: 'addr-1',
  label: 'Home',
  line1: '500 Valencia St',
  city: 'San Francisco',
  postcode: '94110',
  latitude: 37.7626,
  longitude: -122.4148,
  ...overrides,
});

describe('resolveActiveAddress', () => {
  it('returns null when there is nothing saved', () => {
    expect(resolveActiveAddress([], null)).toBeNull();
    expect(resolveActiveAddress([], 'addr-1')).toBeNull();
  });

  it('returns the explicitly selected address when it exists', () => {
    const home = address({ id: 'addr-1', label: 'Home' });
    const office = address({ id: 'addr-2', label: 'Office' });

    expect(resolveActiveAddress([home, office], 'addr-2')).toEqual(office);
  });

  it('falls back to the first (most recently saved) address when nothing is selected', () => {
    const newest = address({ id: 'addr-2', label: 'Office' });
    const oldest = address({ id: 'addr-1', label: 'Home' });

    expect(resolveActiveAddress([newest, oldest], null)).toEqual(newest);
  });

  it('falls back to the first address when the selected id no longer exists', () => {
    const remaining = address({ id: 'addr-1', label: 'Home' });

    expect(resolveActiveAddress([remaining], 'addr-deleted')).toEqual(remaining);
  });
});
