import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { ErrorState, LoadingState, ScreenHeader } from '@/components/shared';
import { Button, Text, TextField } from '@/components/ui';
import { useRestaurantMenu } from '@/features/menu/hooks/useRestaurantMenu';
import type { MenuItem } from '@/features/menu/types/menu.types';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';

import { sectionsOf, useCreateDish, useDeleteDish, useUpdateDish } from '../hooks/useMenuAdmin';
import type { DishFormValues } from '../types/dish.types';
import { dishFormSchema } from '../types/dish.types';

const toMajor = (minor: number): string => (minor / 100).toFixed(2);
const toMinor = (major: string): number => Math.round(Number(major) * 100);

/** Adding when only a section is given; editing when a dish is. */
export function ManageDishScreen() {
  const { itemId, categoryId } = useLocalSearchParams<{ itemId?: string; categoryId?: string }>();

  const role = useSessionStore((state) => state.role);
  const restaurantId = role.kind === 'kitchen' ? role.restaurantId : '';

  const { data: menu, isPending, error, refetch } = useRestaurantMenu(restaurantId);

  if (isPending) return <LoadingState className="flex-1 items-center justify-center" />;
  if (error || !menu) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        className="flex-1 items-center justify-center px-8"
      />
    );
  }

  const dish = itemId
    ? menu.flatMap((category) => category.menuItems).find((item) => item.id === itemId)
    : undefined;

  return (
    <DishForm
      key={dish?.id ?? categoryId ?? 'new'}
      restaurantId={restaurantId}
      sections={sectionsOf(menu)}
      dish={dish}
      initialCategoryId={dish?.menuCategoryId ?? categoryId ?? menu[0]?.id ?? ''}
    />
  );
}

type DishFormProps = {
  restaurantId: string;
  sections: { id: string; name: string }[];
  dish: MenuItem | undefined;
  initialCategoryId: string;
};

function DishForm({ restaurantId, sections, dish, initialCategoryId }: DishFormProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const create = useCreateDish(restaurantId);
  const update = useUpdateDish(restaurantId);
  const remove = useDeleteDish(restaurantId);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<DishFormValues>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      name: dish?.name ?? '',
      description: dish?.description ?? '',
      price: dish ? toMajor(dish.priceMinor) : '',
      menuCategoryId: initialCategoryId,
    },
  });

  const chosenSection = watch('menuCategoryId');
  const isSaving = create.isPending || update.isPending;

  const save = handleSubmit((values) => {
    const fields = {
      menuCategoryId: values.menuCategoryId,
      name: values.name.trim(),
      description: values.description.trim(),
      priceMinor: toMinor(values.price),
    };

    const options = {
      onSuccess: () => router.back(),
      onError: (cause: unknown) =>
        Alert.alert(t('manage.menu.saveFailed'), toApiError(cause).message),
    };

    if (dish) update.mutate({ itemId: dish.id, fields }, options);
    else create.mutate(fields, options);
  });

  /**
   * Delete is the exception, not the way to take a dish off the menu — the
   * server refuses it for anything ever ordered, and says so. t6: present sold
   * out as the ordinary move and let this fail honestly when it must.
   */
  const confirmDelete = () => {
    if (!dish) return;

    Alert.alert(t('manage.menu.deleteTitle'), t('manage.menu.deleteBody', { name: dish.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('manage.menu.deleteAction'),
        style: 'destructive',
        onPress: () =>
          remove.mutate(dish.id, {
            onSuccess: () => router.back(),
            onError: (cause) =>
              Alert.alert(t('manage.menu.deleteFailed'), toApiError(cause).message),
          }),
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t(dish ? 'manage.menu.editDish' : 'manage.menu.newDish')} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="gap-4 px-4 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={t('manage.menu.dishName')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={t('manage.menu.dishDescription')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={3}
              />
            )}
          />

          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={t('manage.menu.dishPrice')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.price?.message}
                keyboardType="decimal-pad"
              />
            )}
          />

          <View className="gap-2">
            <Text variant="label" className="text-gray-700">
              {t('manage.menu.dishSection')}
            </Text>

            {/* Chips rather than a picker: a menu has a handful of sections,
                and moving a dish is the reason this screen exists. */}
            <View className="flex-row flex-wrap gap-2">
              {sections.map((section) => {
                const selected = section.id === chosenSection;

                return (
                  <Pressable
                    key={section.id}
                    onPress={() => setValue('menuCategoryId', section.id, { shouldDirty: true })}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={
                      selected
                        ? 'rounded-full bg-primary-500 px-3 py-2'
                        : 'rounded-full border border-gray-200 px-3 py-2'
                    }
                  >
                    <Text
                      variant="caption"
                      className={selected ? 'font-semibold text-white' : 'text-gray-700'}
                    >
                      {section.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {errors.menuCategoryId ? (
              <Text variant="caption" className="text-error-500">
                {errors.menuCategoryId.message}
              </Text>
            ) : null}
          </View>

          <Button onPress={save} disabled={isSaving || (dish !== undefined && !isDirty)}>
            {isSaving ? t('common.saving') : t('common.save')}
          </Button>

          {dish ? (
            <>
              <Text variant="caption" className="text-center text-gray-400">
                {t('manage.menu.deleteHint')}
              </Text>

              <Pressable
                onPress={confirmDelete}
                disabled={remove.isPending}
                accessibilityRole="button"
                className="flex-row items-center justify-center gap-1.5 py-2 active:opacity-70"
              >
                <Ionicons name="trash-outline" size={15} color={colors.error[500]} />
                <Text variant="label" className="text-error-500">
                  {t('manage.menu.deleteAction')}
                </Text>
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
