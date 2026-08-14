import { render, screen } from '@testing-library/react-native';

// expo-image's native side does not load under jest-expo; the frame is what matters here.
jest.mock('expo-image', () => ({ Image: require('react-native').View }));

import { Photo } from './Photo';

describe('Photo', () => {
  it('renders nothing when there is no photograph', async () => {
    await render(<Photo uri="" className="h-36 w-full" />);

    expect(screen.toJSON()).toBeNull();
  });

  it('renders the image when there is one', async () => {
    await render(<Photo uri="https://example.test/dish.jpg" className="h-36 w-full" />);

    expect(screen.toJSON()).not.toBeNull();
  });

  /**
   * The bug this component exists to kill: the frame's grey background used to
   * show through whether or not a `uri` was set, so a dish with no photograph
   * rendered exactly like one whose photograph failed to load. Assert the frame
   * is gone too, or a regression that keeps the empty box still passes.
   */
  it('renders no frame either, so nothing occupies the space', async () => {
    await render(<Photo uri="" className="h-36 w-full bg-gray-200" />);

    expect(JSON.stringify(screen.toJSON())).not.toContain('bg-gray-200');
  });
});
