import { create } from 'zustand';

type PlaybackState = {
  /** One global: per-cell mute would let a fast fling play two audios at once. */
  muted: boolean;
  toggleMuted: () => void;
};

/** Deliberately not persisted — sound is a fresh choice each app open. */
export const usePlaybackStore = create<PlaybackState>((set) => ({
  muted: true,
  toggleMuted: () => set((state) => ({ muted: !state.muted })),
}));
