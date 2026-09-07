import { create } from 'zustand';

const MAX_RECENTS = 5;

type SearchState = {
  /**
   * What was searched for lately, newest first. Session-only: nothing on this
   * device persists yet — the Cart does not survive a relaunch either (#147) —
   * and a list of five words is not the place to start.
   */
  recents: string[];
  remember: (term: string) => void;
};

export const useSearchStore = create<SearchState>((set) => ({
  recents: [],

  remember: (term) => {
    const clean = term.trim();
    if (!clean) return;

    set((state) => ({
      recents: [
        clean,
        ...state.recents.filter((known) => known.toLowerCase() !== clean.toLowerCase()),
      ].slice(0, MAX_RECENTS),
    }));
  },
}));
