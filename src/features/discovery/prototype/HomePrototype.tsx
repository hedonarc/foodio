/**
 * PROTOTYPE — not production. Throwaway; lives on its own branch.
 *
 * Three variants of Home's categories and search, switchable via `?variant=`
 * on the existing Home route behind the dev-only floating bar. `home` is the
 * shipped screen, kept in the wheel so the baseline is one arrow away.
 *
 * The question: what should cuisine categories on Home look like, what happens
 * when the search field is tapped — a sheet over a blurred Home, a full-screen
 * takeover, or results in place — and where do the filters live?
 *
 *   A  Rail + top sheet      round icon rail; sheet drops over blurred Home;
 *                            filters are a chip row in the sheet
 *   B  Tiles + filter sheet  two-row photo tiles; full-screen takeover with
 *                            compact rows; one Filters button → bottom sheet
 *   C  Pills + in place      pills filter Home live; typing blurs the body and
 *                            renders results over it under a sort control
 *
 * Results are the real `GET /restaurants?q=` narrowed on the device; recents
 * are in memory. No persistence, no tests, no i18n — on purpose.
 */
import { LogBox } from 'react-native';

import type { PrototypeVariant } from '@/components/shared/PrototypeSwitcher';

import { NAME_A, VariantA } from './VariantA';
import { NAME_B, VariantB } from './VariantB';
import { NAME_C, VariantC } from './VariantC';

// The dev warning badge sat over every screenshot of these variants. This
// branch is throwaway; the warnings are not its business.
if (__DEV__) LogBox.ignoreAllLogs();

export const HOME_VARIANTS: readonly PrototypeVariant[] = [
  { key: 'home', name: 'Shipped Home' },
  { key: 'A', name: NAME_A },
  { key: 'B', name: NAME_B },
  { key: 'C', name: NAME_C },
];

export function HomePrototype({ variant }: { variant: string }) {
  switch (variant) {
    case 'A':
      return <VariantA />;
    case 'B':
      return <VariantB />;
    case 'C':
      return <VariantC />;
    default:
      return null;
  }
}
