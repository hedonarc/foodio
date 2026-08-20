/**
 * PROTOTYPE — throwaway. Not wired into checkout, not production code.
 *
 * Answers Wayfinder ticket t7, "Data-driven checkout". Three structurally
 * different takes on the same job, switchable from the bar at the bottom.
 * See `app/prototype-checkout.tsx`.
 */

export type Method = {
  code: string;
  label: string;
  hint: string;
  icon: 'cash-outline' | 'card-outline' | 'help-circle-outline';
};

export const CASH: Method = {
  code: 'cash_on_delivery',
  label: 'Cash on delivery',
  hint: 'Pay the rider when your order arrives',
  icon: 'cash-outline',
};

export const CARD: Method = {
  code: 'card',
  label: 'Card',
  hint: 'Visa or debit — held now, taken when the restaurant accepts',
  icon: 'card-outline',
};

/**
 * Not a product option — a failure case. Cash and card are the only methods
 * Foodio will offer, but a server can always send something else, and t4 exists
 * because an unreadable value used to discard the whole response.
 */
export const UNREADABLE: Method = {
  code: 'raast_p2m',
  label: 'Raast',
  hint: '',
  icon: 'help-circle-outline',
};

/**
 * The scenarios the switcher cycles through.
 *
 * The ticket also asked for "a restaurant offering three methods". There is no
 * such restaurant and never will be: cash and card are the only two, by
 * direction. That is the finding, not an omission.
 */
export const SCENARIOS = [
  { key: 'cash', name: 'Cash only — today', methods: [CASH] },
  { key: 'both', name: 'Cash + card — the plan', methods: [CASH, CARD] },
  { key: 'unreadable', name: 'One the app cannot read', methods: [CASH, CARD, UNREADABLE] },
] as const;

/** Whether this build has UI for a method the server sent. */
export const isKnown = (method: Method): boolean => method.code !== UNREADABLE.code;

export const money = (minor: number): string =>
  `PKR ${(minor / 100).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;

export const TOTAL_MINOR = 133000;
