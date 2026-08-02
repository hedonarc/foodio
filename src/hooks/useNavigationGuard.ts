import { useCallback } from 'react';

import { useNavigation } from 'expo-router';

type Navigate = () => void;
type NavigationGuard = (navigate: Navigate) => void;

/**
 * Split from the hook so the rule is testable without a renderer — this repo
 * has none (see issue #18).
 */
export function createNavigationGuard(isFocused: () => boolean): NavigationGuard {
  return (navigate) => {
    if (!isFocused()) return;
    navigate();
  };
}

/**
 * Drops navigation fired from a screen that has already navigated away — the
 * second half of a double tap. Focus flips on the first push, so the guard
 * needs no timer and never swallows a tap on a different item.
 */
export function useNavigationGuard(): NavigationGuard {
  const navigation = useNavigation();

  return useCallback<NavigationGuard>(
    (navigate) => createNavigationGuard(() => navigation.isFocused())(navigate),
    [navigation],
  );
}
