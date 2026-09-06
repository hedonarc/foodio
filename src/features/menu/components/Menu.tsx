import { useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState } from '@/components/shared';
import { Text } from '@/components/ui';
import type { CartRestaurant } from '@/features/cart';

import { useRestaurantMenu } from '../hooks/useRestaurantMenu';

import { MenuCategorySection } from './MenuCategorySection';

type MenuProps = {
  restaurant: CartRestaurant;
  /**
   * Where each category starts, in the scroll view's own coordinates, so the
   * chips above can scroll to it. Reported as a sum of two offsets — this
   * container's, and the section's within it — because `onLayout` only ever
   * measures against the immediate parent.
   */
  onSectionLayout?: (categoryId: string, y: number) => void;
};

export function Menu({ restaurant, onSectionLayout }: MenuProps) {
  const { t } = useTranslation();
  const { data: categories, isPending, error, refetch } = useRestaurantMenu(restaurant.id);
  const [menuY, setMenuY] = useState(0);

  /**
   * Section positions relative to this container, kept raw.
   *
   * A child lays out before its parent, so a section measures itself while
   * `menuY` is still 0 — adding it at that moment stores an offset a whole
   * section short, which is exactly how the first attempt scrolled to the wrong
   * heading. The raw values are kept and re-reported once the container knows
   * where it sits.
   */
  const rawOffsets = useRef(new Map<string, number>());

  const handleLayout = (event: LayoutChangeEvent) => {
    setMenuY(event.nativeEvent.layout.y);
  };

  const reportSection = (categoryId: string, y: number) => {
    rawOffsets.current.set(categoryId, y);
    onSectionLayout?.(categoryId, menuY + y);
  };

  useEffect(() => {
    for (const [categoryId, y] of rawOffsets.current) {
      onSectionLayout?.(categoryId, menuY + y);
    }
  }, [menuY, onSectionLayout]);

  return (
    <View className="px-4 pb-4" onLayout={handleLayout}>
      <Text variant="bodyMedium" className="mb-1 text-gray-900">
        {t('menu.title')}
      </Text>
      <MenuBody
        categories={categories}
        restaurant={restaurant}
        isPending={isPending}
        error={error}
        onRetry={refetch}
        {...(onSectionLayout === undefined ? {} : { onSectionLayout: reportSection })}
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
  onSectionLayout?: (categoryId: string, y: number) => void;
};

function MenuBody({
  categories,
  restaurant,
  isPending,
  error,
  onRetry,
  onSectionLayout,
}: MenuBodyProps) {
  const { t } = useTranslation();

  if (isPending) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!categories || categories.length === 0) return <EmptyState message={t('menu.empty')} />;

  // No wrapper view: one fewer coordinate space between a section and the
  // container its offset is measured against.
  return (
    <>
      {categories.map((category) => (
        <View
          key={category.id}
          onLayout={(event) => onSectionLayout?.(category.id, event.nativeEvent.layout.y)}
        >
          <MenuCategorySection category={category} restaurant={restaurant} />
        </View>
      ))}
    </>
  );
}
