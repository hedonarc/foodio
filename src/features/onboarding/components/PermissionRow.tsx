import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Button, Text } from '@/components/ui';
import { colors } from '@/theme';

type PermissionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  descriptionKey: string;
  granted: boolean;
  /** Absent once the OS has been asked — it only ever prompts once. */
  onAllow: (() => void) | undefined;
};

export function PermissionRow({
  icon,
  titleKey,
  descriptionKey,
  granted,
  onAllow,
}: PermissionRowProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center border-b border-gray-100 py-5">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
        <Ionicons name={icon} size={20} color={colors.primary[500]} />
      </View>

      <View className="ml-4 flex-1">
        <Text variant="bodyMedium" className="text-gray-900">
          {t(titleKey)}
        </Text>
        <Text variant="caption" className="mt-0.5 text-gray-500">
          {t(descriptionKey)}
        </Text>
      </View>

      {granted ? (
        <Ionicons name="checkmark-circle" size={24} color={colors.success[500]} />
      ) : onAllow ? (
        <Button variant="secondary" onPress={onAllow}>
          {t('common.allow')}
        </Button>
      ) : (
        <Text variant="caption" className="text-gray-400">
          {t('onboarding.notNow')}
        </Text>
      )}
    </View>
  );
}
