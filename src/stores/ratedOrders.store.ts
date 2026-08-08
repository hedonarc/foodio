import { create } from 'zustand';

/**
 * Which orders this session knows to be reviewed. The server owns the truth
 * (the unique `order_id` behind the 409); this is only the session's memory
 * of answers it has already received — a submitted review, or a 409 saying
 * one exists — so the affordance can settle into its quiet "Rated" state.
 */
type RatedOrdersState = {
  ratedOrderIds: Readonly<Record<string, true>>;
  markRated: (orderId: string) => void;
};

export const useRatedOrdersStore = create<RatedOrdersState>((set) => ({
  ratedOrderIds: {},
  markRated: (orderId) =>
    set((state) => ({ ratedOrderIds: { ...state.ratedOrderIds, [orderId]: true } })),
}));

export const useIsOrderRated = (orderId: string): boolean =>
  useRatedOrdersStore((state) => state.ratedOrderIds[orderId] === true);
