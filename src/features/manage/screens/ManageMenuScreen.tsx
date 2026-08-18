import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { EmptyState, ErrorState, LoadingState, ScreenHeader } from '@/components/shared';
import { Button, SheetContainer, Text, TextField } from '@/components/ui';
import { MenuPrice } from '@/features/menu/components/MenuPrice';
import { useRestaurantMenu } from '@/features/menu/hooks/useRestaurantMenu';
import type { MenuCategory } from '@/features/menu/types/menu.types';
import { useRestaurants } from '@/features/restaurants';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';

import { useCreateCategory, useRenameCategory } from '../hooks/useMenuAdmin';

/**
 * The menu as a restaurant owner edits it: sections, and the dishes inside
 * them. t6 kept the sold-out toggle on the Menu tab and put everything else
 * here — a cook flipping a dish off mid-rush should never be one mistap from
 * renaming it.
 *
 * Sections can be created and renamed. Reordering and deleting them are
 * deliberately absent: structure changes about once, prices weekly, and
 * drag-to-reorder is the fiddliest UI on the map for the rarest need.
 */
export function ManageMenuScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const role = useSessionStore((state) => state.role);
  const restaurantId = role.kind === 'kitchen' ? role.restaurantId : '';

  const { data: restaurants } = useRestaurants();
  const currency = restaurants?.find((entry) => entry.id === restaurantId)?.currency;

  const { data: menu, isPending, error, refetch } = useRestaurantMenu(restaurantId);
  const createCategory = useCreateCategory(restaurantId);
  const renameCategory = useRenameCategory(restaurantId);

  /** Null when closed; a category when renaming; `'new'` when creating. */
  const [editing, setEditing] = useState<MenuCategory | 'new' | null>(null);

  const submitSection = (name: string) => {
    const onError = (cause: unknown) =>
      Alert.alert(t('manage.menu.sectionFailed'), toApiError(cause).message);

    if (editing === 'new') {
      createCategory.mutate(name, { onSuccess: () => setEditing(null), onError });
      return;
    }
    if (editing) {
      renameCategory.mutate(
        { categoryId: editing.id, name },
        { onSuccess: () => setEditing(null), onError },
      );
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t('manage.menu.title')} />

      {isPending ? <LoadingState className="flex-1 items-center justify-center" /> : null}
      {error ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          className="flex-1 items-center justify-center px-8"
        />
      ) : null}

      {menu ? (
        <ScrollView contentContainerClassName="pb-10">
          <View className="px-4 pb-2">
            <Text variant="caption" className="text-gray-500">
              {t('manage.menu.subtitle')}
            </Text>
          </View>

          {menu.map((category) => (
            <View key={category.id} className="mt-4">
              <View className="flex-row items-center gap-2 px-4 pb-1">
                <Text variant="label" className="flex-1 text-gray-900">
                  {category.name}
                </Text>

                <Pressable
                  onPress={() => setEditing(category)}
                  accessibilityRole="button"
                  accessibilityLabel={t('manage.menu.renameSection', { name: category.name })}
                  hitSlop={8}
                >
                  <Ionicons name="pencil" size={14} color={colors.gray[400]} />
                </Pressable>
              </View>

              {category.menuItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    router.push({ pathname: '/manage/dish', params: { itemId: item.id } })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-3 active:bg-gray-50"
                >
                  <View className="flex-1">
                    <Text
                      variant="bodyMedium"
                      className={item.isAvailable === false ? 'text-gray-400' : 'text-gray-900'}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {item.isAvailable === false ? (
                      <Text variant="caption" className="mt-0.5 text-gray-400">
                        {t('menu.soldOut')}
                      </Text>
                    ) : null}
                  </View>

                  {currency ? <MenuPrice priceMinor={item.priceMinor} currency={currency} /> : null}
                  <Ionicons name="chevron-forward" size={16} color={colors.gray[300]} />
                </Pressable>
              ))}

              {category.menuItems.length === 0 ? (
                <Text variant="caption" className="px-4 py-3 text-gray-400">
                  {t('manage.menu.emptySection')}
                </Text>
              ) : null}

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/manage/dish',
                    params: { categoryId: category.id },
                  })
                }
                accessibilityRole="button"
                className="flex-row items-center gap-1.5 px-4 py-3 active:opacity-70"
              >
                <Ionicons name="add" size={15} color={colors.primary[600]} />
                <Text variant="label" className="text-primary-600">
                  {t('manage.menu.addDish')}
                </Text>
              </Pressable>
            </View>
          ))}

          {menu.length === 0 ? <EmptyState message={t('manage.menu.empty')} /> : null}

          <View className="px-4 pt-6">
            <Button variant="secondary" onPress={() => setEditing('new')}>
              {t('manage.menu.addSection')}
            </Button>
          </View>
        </ScrollView>
      ) : null}

      <SectionSheet
        target={editing}
        isBusy={createCategory.isPending || renameCategory.isPending}
        onClose={() => setEditing(null)}
        onSubmit={submitSection}
      />
    </SafeAreaView>
  );
}

type SectionSheetProps = {
  target: MenuCategory | 'new' | null;
  isBusy: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

/** One field, so a sheet rather than a screen — see t4 on hours and staff. */
function SectionSheet({ target, isBusy, onClose, onSubmit }: SectionSheetProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  // Keyed on the target so the field is rebuilt, not carried over from the
  // section edited a moment ago.
  const key = target === 'new' ? 'new' : (target?.id ?? 'none');

  return (
    <SheetContainer visible={target !== null} onClose={onClose}>
      <View key={key} className="gap-4">
        <Text variant="subheading" className="text-gray-900">
          {t(target === 'new' ? 'manage.menu.newSection' : 'manage.menu.renameTitle')}
        </Text>

        <TextField
          label={t('manage.menu.sectionName')}
          defaultValue={target === 'new' || !target ? '' : target.name}
          onChangeText={setName}
          autoFocus
        />

        <Button onPress={() => onSubmit(name)} disabled={name.trim() === '' || isBusy}>
          {isBusy ? t('common.saving') : t('common.save')}
        </Button>
      </View>
    </SheetContainer>
  );
}
