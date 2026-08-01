import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

import type { CheckoutBlocker } from '../lib/reviewCheckout';

type CheckoutBlockersProps = {
  blockers: CheckoutBlocker[];
  currency: string;
};

function useBlockerMessage(currency: string) {
  const { t, i18n } = useTranslation();

  return (blocker: CheckoutBlocker): string => {
    switch (blocker.kind) {
      case 'out-of-range':
        return t('checkout.blockers.outOfRange', {
          distance: (blocker.distanceMeters / 1000).toFixed(1),
          radius: (blocker.radiusMeters / 1000).toFixed(1),
        });
      case 'price-changed':
        return t('checkout.blockers.priceChanged', {
          items: blocker.lines
            .map((line) =>
              t('checkout.blockers.priceChangedLine', {
                name: line.name,
                was: formatMoney(line.wasMinor, currency, i18n.language),
                now: formatMoney(line.nowMinor, currency, i18n.language),
              }),
            )
            .join(', '),
        });
      default:
        return t(`checkout.blockers.${blocker.kind}`);
    }
  };
}

export function CheckoutBlockers({ blockers, currency }: CheckoutBlockersProps) {
  const messageFor = useBlockerMessage(currency);

  if (blockers.length === 0) return null;

  return (
    <View className="mt-4 gap-2 rounded-2xl bg-error-500/10 p-4" accessibilityRole="alert">
      {blockers.map((blocker) => (
        <View key={blocker.kind} className="flex-row items-start">
          <Ionicons name="alert-circle-outline" size={16} color={colors.error[500]} />
          <Text variant="caption" className="ml-2 flex-1 text-gray-700">
            {messageFor(blocker)}
          </Text>
        </View>
      ))}
    </View>
  );
}
