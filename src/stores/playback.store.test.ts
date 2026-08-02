import { usePlaybackStore } from './playback.store';

describe('playback store', () => {
  beforeEach(() => {
    usePlaybackStore.setState({ muted: true });
  });

  it('starts muted', () => {
    expect(usePlaybackStore.getState().muted).toBe(true);
  });

  it('toggles the one global flag', () => {
    usePlaybackStore.getState().toggleMuted();
    expect(usePlaybackStore.getState().muted).toBe(false);

    usePlaybackStore.getState().toggleMuted();
    expect(usePlaybackStore.getState().muted).toBe(true);
  });
});
