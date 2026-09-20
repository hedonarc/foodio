import { act, renderHook } from '@testing-library/react-native';

import { useSheetTarget } from './useSheetTarget';

const run = async (fn: () => void) => {
  await act(async () => {
    fn();
  });
};

describe('useSheetTarget', () => {
  it('starts closed with nothing to edit', async () => {
    const { result } = await renderHook(() => useSheetTarget<string>());

    expect(result.current.visible).toBe(false);
    expect(result.current.target).toBeNull();
  });

  it('opens on the thing it was given', async () => {
    const { result } = await renderHook(() => useSheetTarget<string>());

    await run(() => result.current.open('line-1'));

    expect(result.current.visible).toBe(true);
    expect(result.current.target).toBe('line-1');
  });

  it('keeps the target after closing, so the sheet slides out intact', async () => {
    const { result } = await renderHook(() => useSheetTarget<string>());

    await run(() => result.current.open('line-1'));
    await run(() => result.current.close());

    expect(result.current.visible).toBe(false);
    expect(result.current.target).toBe('line-1');
  });

  it('reopens on a different thing', async () => {
    const { result } = await renderHook(() => useSheetTarget<string>());

    await run(() => result.current.open('line-1'));
    await run(() => result.current.close());
    await run(() => result.current.open('line-2'));

    expect(result.current.visible).toBe(true);
    expect(result.current.target).toBe('line-2');
  });
});
