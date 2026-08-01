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
  /** The line's own id, so duplicates with different options can coexist later. */
  id: string;
  menuItemId: string;
  name: string;
  image: string;
  /** Snapshot at add time — the Cart must not reprice under the customer. */
  unitPriceMinor: number;
  quantity: number;
};
