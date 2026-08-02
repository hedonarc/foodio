import { fireEvent, render, screen } from '@testing-library/react-native';

import { Link } from './Link';

describe('Link', () => {
  it('fires when the text itself is pressed', async () => {
    const onPress = jest.fn();
    await render(<Link onPress={onPress}>Skip</Link>);

    fireEvent.press(screen.getByText('Skip'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
