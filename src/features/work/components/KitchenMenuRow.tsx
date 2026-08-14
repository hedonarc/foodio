import { Switch, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { MenuPrice } from '@/features/menu/components/MenuPrice';
import type { MenuItem } from '@/features/menu/types/menu.types';
import { colors } from '@/theme';

import { PhotoButton } from './PhotoButton';

type KitchenMenuRowProps = {
  item: MenuItem;
  currency: string | undefined;
  onToggle: (isAvailable: boolean) => void;
  onPickPhoto: () => void;
  isUploadingPhoto: boolean;
};

/** Name, price, one switch — and the dish's photograph, which is the one thing
 * a kitchen can only fix from here. Issue #92 kept everything else concierge. */
export function KitchenMenuRow({
  item,
  currency,
  onToggle,
  onPickPhoto,
  isUploadingPhoto,
}: KitchenMenuRowProps) {
  const { t } = useTranslation();
  const soldOut = item.isAvailable === false;

  return (
    <View className="flex-row items-center border-b border-gray-100 py-3">
      <PhotoButton
        uri={item.image}
        onPress={onPickPhoto}
        isBusy={isUploadingPhoto}
        accessibilityLabel={t('work.menu.photoFor', { name: item.name })}
        accessibilityHint={item.image ? t('work.menu.changePhoto') : t('work.menu.addPhoto')}
        className="mr-3 h-14 w-14"
      />

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
