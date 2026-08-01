import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { formatMoney } from '@/utils/currency';

type MenuPriceProps = {
  priceMinor: number;
  currency: string;
};

export function MenuPrice({ priceMinor, currency }: MenuPriceProps) {
  const { i18n } = useTranslation();

  return (
    <Text variant="bodyMedium" className="text-gray-900">
      {formatMoney(priceMinor, currency, i18n.language)}
    </Text>
  );
}
