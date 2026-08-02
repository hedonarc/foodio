import { renderHook } from '@testing-library/react-native';

import { useNavigationGuard } from './useNavigationGuard';

const mockIsFocused = jest.fn();

jest.mock('expo-router', () => ({
  useNavigation: () => ({ isFocused: () => mockIsFocused() }),
}));

describe('useNavigationGuard through a renderer', () => {
  it('drops the second tap once focus has moved', async () => {
    mockIsFocused.mockReturnValue(true);
    const navigate = jest.fn();

    const { result } = await renderHook(() => useNavigationGuard());
    result.current(navigate);

    mockIsFocused.mockReturnValue(false);
    result.current(navigate);

    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
