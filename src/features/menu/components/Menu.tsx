import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState } from '@/components/shared';
import { Text } from '@/components/ui';

import { useRestaurantMenu } from '../hooks/useRestaurantMenu';

import { MenuCategorySection } from './MenuCategorySection';

type MenuProps = {
  restaurantId: string;
  /** ISO 4217 code from the owning restaurant — every price here uses it. */
  currency: string;
};

export function Menu({ restaurantId, currency }: MenuProps) {
  const { t } = useTranslation();
  const { data: categories, isPending, error, refetch } = useRestaurantMenu(restaurantId);

  return (
    <View className="px-4 pb-4">
      <Text variant="bodyMedium" className="mb-1 text-gray-900">
        {t('menu.title')}
      </Text>
      <MenuBody
        categories={categories}
        currency={currency}
        isPending={isPending}
        error={error}
        onRetry={refetch}
      />
    </View>
  );
}

type MenuBodyProps = {
  categories: ReturnType<typeof useRestaurantMenu>['data'];
  currency: string;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
};

function MenuBody({ categories, currency, isPending, error, onRetry }: MenuBodyProps) {
  const { t } = useTranslation();

  if (isPending) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!categories || categories.length === 0) return <EmptyState message={t('menu.empty')} />;

  return (
    <View>
      {categories.map((category) => (
        <MenuCategorySection key={category.id} category={category} currency={currency} />
      ))}
    </View>
  );
}
