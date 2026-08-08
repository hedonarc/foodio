import { Switch, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { MenuPrice } from '@/features/menu/components/MenuPrice';
import type { MenuItem } from '@/features/menu/types/menu.types';
import { colors } from '@/theme';

type KitchenMenuRowProps = {
  item: MenuItem;
  currency: string | undefined;
  onToggle: (isAvailable: boolean) => void;
};

/** Name, price, one switch. Everything else stays concierge — issue #92. */
export function KitchenMenuRow({ item, currency, onToggle }: KitchenMenuRowProps) {
  const { t } = useTranslation();
  const soldOut = item.isAvailable === false;

  return (
    <View className="flex-row items-center border-b border-gray-100 py-3">
      <View className="flex-1 pr-3">
        <Text
          variant="bodyMedium"
          className={soldOut ? 'text-gray-400' : 'text-gray-900'}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View className="mt-0.5 flex-row items-center">
          {currency ? <MenuPrice priceMinor={item.priceMinor} currency={currency} /> : null}
          {soldOut ? (
            <Text variant="caption" className="ml-2 font-semibold text-gray-500">
              {t('menu.soldOut')}
            </Text>
          ) : null}
        </View>
      </View>
      <Switch
        value={!soldOut}
        onValueChange={onToggle}
        accessibilityLabel={t('work.menu.availabilityFor', { name: item.name })}
        trackColor={{ true: colors.primary[500], false: colors.gray[300] }}
      />
    </View>
  );
}
