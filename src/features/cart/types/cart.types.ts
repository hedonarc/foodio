/**
 * The restaurant a Cart is bound to. A Cart belongs to exactly one — see
 * docs/adr/0003-restaurant-owned-delivery.md.
 *
 * Copied into the Cart rather than referenced by id so the cart screen can
 * render totals without waiting on a request.
 */
export type CartRestaurant = {
  id: string;
  name: string;
  /** ISO 4217. Every amount in this Cart is denominated in it. */
  currency: string;
  deliveryFeeMinor: number;
};

/** A menu item as the Cart needs it — enough to render a line without refetching. */
export type AddableMenuItem = {
  id: string;
  name: string;
  image: string;
  priceMinor: number;
};

export type CartLine = {
  /**
   * The line's own id, not the menu item's. Costs nothing today and is what
   * lets two lines of the same dish with different options coexist once
   * modifiers exist.
   */
  id: string;
  menuItemId: string;
  name: string;
  image: string;
  /**
   * What the item cost when it was added. Deliberately a snapshot: prices
   * change while a customer shops, and the Cart must not silently reprice
   * under them. Re-validated at checkout.
   */
  unitPriceMinor: number;
  quantity: number;
};
