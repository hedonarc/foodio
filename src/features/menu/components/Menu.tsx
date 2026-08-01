import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState } from '@/components/shared';
import { Text } from '@/components/ui';
import type { CartRestaurant } from '@/features/cart';

import { useRestaurantMenu } from '../hooks/useRestaurantMenu';

import { MenuCategorySection } from './MenuCategorySection';

type MenuProps = {
  /**
   * The owning restaurant. Carries the currency every price here is rendered
   * in, and is what a cart line gets bound to when an item is added.
   */
  restaurant: CartRestaurant;
};

export function Menu({ restaurant }: MenuProps) {
  const { t } = useTranslation();
  const { data: categories, isPending, error, refetch } = useRestaurantMenu(restaurant.id);

  return (
    <View className="px-4 pb-4">
      <Text variant="bodyMedium" className="mb-1 text-gray-900">
        {t('menu.title')}
      </Text>
      <MenuBody
        categories={categories}
        restaurant={restaurant}
        isPending={isPending}
        error={error}
        onRetry={refetch}
      />
    </View>
  );
}

type MenuBodyProps = {
  categories: ReturnType<typeof useRestaurantMenu>['data'];
  restaurant: CartRestaurant;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
};

function MenuBody({ categories, restaurant, isPending, error, onRetry }: MenuBodyProps) {
  const { t } = useTranslation();

  if (isPending) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!categories || categories.length === 0) return <EmptyState message={t('menu.empty')} />;

  return (
    <View>
      {categories.map((category) => (
        <MenuCategorySection key={category.id} category={category} restaurant={restaurant} />
      ))}
    </View>
  );
}
