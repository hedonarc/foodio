import { useTranslation } from 'react-i18next';

import { formatTimeOfDay, formatWeekday, isOpenAt, nextOpening } from '@/utils/openingHours';

import type { Restaurant } from '../types/restaurant.types';

export type OpeningNotice = {
  isOpen: boolean;
  /** "Opens at 11:30 AM" / "Opens Monday at 11:30 AM" — null while open, or with no hours. */
  opensText: string | null;
};

/**
 * Whether the doors are open right now and, if not, when they next are — in
 * the Restaurant's own clock (#156). A Closed pill alone gives a customer no
 * reason to come back rather than leave.
 */
export function useOpeningNotice(
  restaurant: Pick<Restaurant, 'openingHours' | 'timezone'>,
): OpeningNotice {
  const { t, i18n } = useTranslation();
  const now = new Date();
  const isOpen = isOpenAt(restaurant.openingHours, now, restaurant.timezone);
  if (isOpen) return { isOpen, opensText: null };

  const next = nextOpening(restaurant.openingHours, now, restaurant.timezone);
  if (!next) return { isOpen, opensText: null };

  const time = formatTimeOfDay(next.opensAt, i18n.language);
  const opensText = next.isToday
    ? t('restaurant.opensToday', { time })
    : t('restaurant.opensOn', { day: formatWeekday(next.dayOfWeek, i18n.language, 'long'), time });
  return { isOpen, opensText };
}
