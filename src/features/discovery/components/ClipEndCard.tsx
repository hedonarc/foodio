import { View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Button, Text } from '@/components/ui';
import { colors } from '@/theme';

type ClipEndCardProps = {
  height: number;
};

/** The honest bottom of a small catalogue — and a route to the menus (#37). */
export function ClipEndCard({ height }: ClipEndCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={{ height }} className="items-center justify-center bg-black px-10">
      <Ionicons name="checkmark-circle-outline" size={48} color={colors.primary[500]} />
      <Text variant="subheading" className="mt-4 text-center text-white">
        {t('clips.endTitle')}
      </Text>
      <Text variant="caption" className="mt-2 text-center text-gray-400">
        {t('clips.endBody')}
      </Text>
      <Button onPress={() => router.navigate('/')} className="mt-8">
        {t('clips.browseRestaurants')}
      </Button>
    </View>
  );
}
