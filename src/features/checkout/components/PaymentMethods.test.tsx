import { render, screen } from '@testing-library/react-native';

// The ui barrel reaches expo-image, whose native side does not load under jest.
jest.mock('expo-image', () => ({ Image: require('react-native').View }));

import { PaymentMethods } from './PaymentMethods';

import '@/i18n';

const noop = () => {};

describe('PaymentMethods', () => {
  it('announces card without offering it', async () => {
    await render(
      <PaymentMethods methods={['cash_on_delivery']} chosen="cash_on_delivery" onChoose={noop} />,
    );

    expect(screen.getByText('Card')).toBeTruthy();
    expect(screen.getByText('Coming soon')).toBeTruthy();
    // One choice on the screen, and card is not it.
    expect(screen.queryAllByRole('radio')).toHaveLength(1);
  });

  it('skips a method it cannot render, and says so', async () => {
    await render(
      <PaymentMethods
        methods={['cash_on_delivery', 'raast']}
        chosen="cash_on_delivery"
        onChoose={noop}
      />,
    );

    expect(screen.getByText('Cash on delivery')).toBeTruthy();
    expect(screen.getByText(/cannot show/)).toBeTruthy();
  });
});
