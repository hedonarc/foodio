import { useState } from 'react';

/**
 * One sheet for a list of things, kept whole while it animates out.
 *
 * The target outlives `visible` deliberately: dropping it on close empties the
 * sheet's title and text mid-slide. Two pieces of state that must stay in step
 * live here once rather than in each screen that edits a row.
 *
 * Screens hold the sheet beside their list, never inside it — a Modal that is
 * a React child of a ScrollView still loses its first tap to that ScrollView
 * while the keyboard is up (#206, #211).
 */
export function useSheetTarget<T>() {
  const [target, setTarget] = useState<T | null>(null);
  const [visible, setVisible] = useState(false);

  const open = (next: T) => {
    setTarget(next);
    setVisible(true);
  };

  return { target, visible, open, close: () => setVisible(false) };
}
