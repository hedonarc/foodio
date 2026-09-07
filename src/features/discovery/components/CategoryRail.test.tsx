import { render, screen } from '@testing-library/react-native';

// The ui barrel reaches expo-image, whose native side does not load under jest.
jest.mock('expo-image', () => ({ Image: require('react-native').View }));

import type { RestaurantSummary } from '@/features/restaurants';

import { CategoryRail } from './CategoryRail';

import '@/i18n';

const mockRestaurants = jest.fn<{ data: RestaurantSummary[] | undefined }, []>();
jest.mock('@/features/restaurants', () => ({ useRestaurants: () => mockRestaurants() }));
jest.mock('@/features/checkout/hooks/useActiveAddress', () => ({
  useActiveAddress: () => ({ address: null }),
}));
// The rail navigates, and there is no navigator around a component under test.
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/hooks/useNavigationGuard', () => ({
  useNavigationGuard: () => (navigate: () => void) => navigate(),
}));

const serving = (id: string, cuisines: string[]) =>
  ({ id, name: id, cuisines }) as RestaurantSummary;

describe('CategoryRail', () => {
  it('renders nothing before the restaurants arrive', async () => {
    mockRestaurants.mockReturnValue({ data: undefined });

    await render(<CategoryRail />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('shows one button per cuisine anybody cooks', async () => {
    mockRestaurants.mockReturnValue({
      data: [serving('a', ['Pizza', 'Pasta']), serving('b', ['Pizza'])],
    });

    await render(<CategoryRail />);

    expect(screen.getByRole('button', { name: 'Pizza' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pasta' })).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(2);
  });
});
