import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** True while the app is on screen — the queue only polls when someone can see it. */
export function useAppForeground(): boolean {
  const [isForeground, setIsForeground] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setIsForeground(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  return isForeground;
}
