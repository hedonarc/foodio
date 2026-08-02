/** A Cart belongs to exactly one — see docs/adr/0003. */
export type CartRestaurant = {
  id: string;
  name: string;
  /** ISO 4217. Every amount in this Cart is denominated in it. */
  currency: string;
  deliveryFeeMinor: number;
};

/** Enough of a menu item to render a cart line without refetching. */
export type AddableMenuItem = {
  id: string;
  name: string;
  image: string;
  priceMinor: number;
};

export type CartLine = {
  /** The line's own id — one dish can hold several lines, one per instruction. */
  id: string;
  menuItemId: string;
  name: string;
  image: string;
  /** Snapshot at add time — the Cart must not reprice under the customer. */
  unitPriceMinor: number;
  quantity: number;
  /**
   * What the customer asked for. Empty is a value, not an absence: the plain
   * line is simply the one with no instruction.
   */
  instruction: string;
};

/**
 * Identity is dish *and* instruction. Trimmed, because trailing whitespace is
 * invisible and merging on it never surprises anyone — but never case-folded,
 * since capitalisation is a deliberate keystroke.
 */
export const sameLine = (line: CartLine, menuItemId: string, instruction: string): boolean =>
  line.menuItemId === menuItemId && line.instruction === instruction.trim();
