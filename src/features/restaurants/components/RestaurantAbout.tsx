import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';

type RestaurantAboutProps = {
  description: string;
};

/** The Restaurant in its own words — after the menu, where it argues for the order rather than delaying it. */
export function RestaurantAbout({ description }: RestaurantAboutProps) {
  const { t } = useTranslation();

  if (description.trim().length === 0) return null;

  return (
    <View className="border-t border-gray-100 px-4 py-5">
      <Text variant="bodyMedium" className="mb-2 text-gray-900">
        {t('restaurant.about')}
      </Text>
      <Text variant="body" className="leading-relaxed text-gray-600">
        {description}
      </Text>
    </View>
  );
}
