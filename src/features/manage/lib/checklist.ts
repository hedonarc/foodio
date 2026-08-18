import type { Restaurant } from '@/features/restaurants';

export type ChecklistKey = 'dish' | 'hours' | 'describe' | 'staff' | 'live';

export type ChecklistStep = {
  key: ChecklistKey;
  done: boolean;
  /** Required before the restaurant may open at all — t2's single bar. */
  required: boolean;
  route: string;
};

type Facts = {
  restaurant: Pick<Restaurant, 'status' | 'description' | 'address' | 'cuisines' | 'openingHours'>;
  dishCount: number;
  staffCount: number;
};

/**
 * What is left to finish, read off facts that already exist.
 *
 * Deliberately not stored progress (t5): there is nothing to migrate, nothing
 * to fall out of sync, and it stays correct when things are done out of order
 * or undone later. Deleting your last dish un-ticks the dish step, which is
 * exactly what the server thinks too.
 */
export function checklistFor({ restaurant, dishCount, staffCount }: Facts): ChecklistStep[] {
  return [
    { key: 'dish', done: dishCount > 0, required: true, route: '/manage/menu' },
    {
      key: 'hours',
      done: restaurant.openingHours.length > 0,
      required: false,
      route: '/manage/hours',
    },
    { key: 'describe', done: isDescribed(restaurant), required: false, route: '/manage/profile' },
    { key: 'staff', done: staffCount > 1, required: false, route: '/manage/staff' },
    // Never ticked by finishing the list. Going live is a deliberate tap (t5).
    { key: 'live', done: restaurant.status === 'active', required: false, route: '/manage/live' },
  ];
}

/**
 * All three, not any one. A name alone tells a customer nothing about whether
 * to order, and these are the fields the discovery card and the restaurant
 * page are built out of.
 */
const isDescribed = (
  restaurant: Pick<Restaurant, 'description' | 'address' | 'cuisines'>,
): boolean =>
  restaurant.description.trim() !== '' &&
  restaurant.address.trim() !== '' &&
  restaurant.cuisines.length > 0;

/** The checklist is for finishing a restaurant, so it retires once it is open. */
export const isFinishing = (status: Restaurant['status']): boolean => status === 'onboarding';

export const remainingCount = (steps: ChecklistStep[]): number =>
  steps.filter((step) => !step.done).length;
