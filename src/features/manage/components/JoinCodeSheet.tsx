import { Share, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Button, SheetContainer, Text } from '@/components/ui';
import { colors } from '@/theme';

import type { JoinCode } from '../types/staff.types';

type JoinCodeSheetProps = {
  code: JoinCode | null;
  restaurantName: string;
  onClose: () => void;
};

/**
 * The one moment the code exists outside the server. It is stored hashed, so
 * there is no screen that can show it again — which is why this says so plainly
 * rather than letting an owner dismiss it and go looking.
 */
export function JoinCodeSheet({ code, restaurantName, onClose }: JoinCodeSheetProps) {
  const { t } = useTranslation();

  const share = () => {
    if (!code) return;
    void Share.share({
      message: t('manage.staff.shareMessage', {
        code: code.code,
        restaurant: restaurantName,
      }),
    });
  };

  return (
    <SheetContainer visible={code !== null} onClose={onClose}>
      {code ? (
        <View className="gap-4">
          <View className="gap-1">
            <Text variant="subheading" className="text-gray-900">
              {t(
                code.capability === 'kitchen'
                  ? 'manage.staff.kitchenCodeTitle'
                  : 'manage.staff.riderCodeTitle',
              )}
            </Text>
            <Text variant="caption" className="text-gray-500">
              {t('manage.staff.codeSubtitle')}
            </Text>
          </View>

          <View className="items-center rounded-2xl bg-primary-50 py-6">
            {/* Spaced out because this gets read aloud down a phone line. */}
            <Text className="text-[34px] font-bold leading-10 tracking-[6px] text-primary-700">
              {code.code}
            </Text>
          </View>

          <View className="flex-row items-start gap-2 rounded-2xl bg-warning-100 p-3">
            <Ionicons name="alert-circle-outline" size={16} color={colors.warning[700]} />
            <Text variant="caption" className="flex-1 text-warning-700">
              {t('manage.staff.codeWarning')}
            </Text>
          </View>

          <Button onPress={share} icon={<Ionicons name="share-outline" size={16} color="white" />}>
            {t('manage.staff.shareCode')}
          </Button>

          <Button variant="secondary" onPress={onClose}>
            {t('common.done')}
          </Button>
        </View>
      ) : null}
    </SheetContainer>
  );
}
