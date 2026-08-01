import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { selectSubtotalMinor, selectTotalMinor, useCartStore } from '@/stores/cart.store';
import { formatMoney } from '@/utils/currency';

type CartSummaryProps = {
  currency: string;
  deliveryFeeMinor: number;
};

export function CartSummary({ currency, deliveryFeeMinor }: CartSummaryProps) {
  const { t, i18n } = useTranslation();

  const subtotalMinor = useCartStore(selectSubtotalMinor);
  const totalMinor = useCartStore(selectTotalMinor);

  const money = (minorUnits: number) => formatMoney(minorUnits, currency, i18n.language);

  return (
    <View className="mt-4 rounded-2xl bg-gray-50 p-4">
      <Row label={t('cart.subtotal')} value={money(subtotalMinor)} />
      <Row
        label={t('cart.deliveryFee')}
        value={deliveryFeeMinor === 0 ? t('cart.free') : money(deliveryFeeMinor)}
      />
      <View className="mt-2 border-t border-gray-200 pt-2">
        <Row label={t('cart.total')} value={money(totalMinor)} emphasised />
      </View>
    </View>
  );
}

type RowProps = {
  label: string;
  value: string;
  emphasised?: boolean;
};

function Row({ label, value, emphasised = false }: RowProps) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text
        variant={emphasised ? 'bodyMedium' : 'caption'}
        className={emphasised ? 'text-gray-900' : 'text-gray-500'}
      >
        {label}
      </Text>
      <Text
        variant={emphasised ? 'bodyMedium' : 'caption'}
        className={emphasised ? 'text-gray-900' : 'text-gray-600'}
      >
        {value}
      </Text>
    </View>
  );
}
