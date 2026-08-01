import { useEffect, useState } from 'react';

/** Trailing debounce: settles on the last value after `delayMs` of quiet. */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return settled;
}
