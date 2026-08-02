import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** The OS reduce-motion setting, kept live while the app runs. */
export function useReduceMotion(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setEnabled(value);
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setEnabled);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return enabled;
}
