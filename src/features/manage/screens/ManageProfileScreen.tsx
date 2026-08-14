import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { ErrorState, LoadingState, ScreenHeader } from '@/components/shared';
import { Button, Text, TextField } from '@/components/ui';
import { useRestaurant } from '@/features/restaurants';
import { useSessionStore } from '@/stores/session.store';

import { useUpdateRestaurant } from '../hooks/useUpdateRestaurant';
import { profileDefaults, profilePatch } from '../lib/profileForm';
import type { ProfileFormValues } from '../types/profile.types';
import { profileFormSchema } from '../types/profile.types';

export function ManageProfileScreen() {
  const router = useRouter();

  const role = useSessionStore((state) => state.role);
  const restaurantId = role.kind === 'kitchen' ? role.restaurantId : '';

  const { data: restaurant, isPending, error, refetch } = useRestaurant(restaurantId);

  if (isPending) return <LoadingState className="flex-1 items-center justify-center" />;
  if (error || !restaurant) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        className="flex-1 items-center justify-center px-8"
      />
    );
  }

  // Keyed on the id so the form is rebuilt, not reset, if the role changes
  // underneath it — `defaultValues` is only read once.
  return <ProfileForm key={restaurant.id} restaurant={restaurant} onSaved={() => router.back()} />;
}

type ProfileFormProps = {
  restaurant: Parameters<typeof profileDefaults>[0];
  onSaved: () => void;
};

const FIELDS = [
  { name: 'name', multiline: false, keyboard: 'default' },
  { name: 'description', multiline: true, keyboard: 'default' },
  { name: 'address', multiline: true, keyboard: 'default' },
  { name: 'cuisines', multiline: false, keyboard: 'default' },
  { name: 'deliveryFee', multiline: false, keyboard: 'decimal-pad' },
] as const;

function ProfileForm({ restaurant, onSaved }: ProfileFormProps) {
  const { t } = useTranslation();
  const update = useUpdateRestaurant(restaurant.id);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileDefaults(restaurant),
  });

  const save = handleSubmit((values) => {
    update.mutate(profilePatch(values), { onSuccess: onSaved });
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t('manage.profile.title')} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="gap-4 px-4 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          {FIELDS.map((field) => (
            <Controller
              key={field.name}
              control={control}
              name={field.name}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label={t(`manage.profile.fields.${field.name}`)}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors[field.name]?.message}
                  multiline={field.multiline}
                  keyboardType={field.keyboard}
                  numberOfLines={field.multiline ? 3 : 1}
                />
              )}
            />
          ))}

          <View className="flex-row gap-3">
            {(['minMinutes', 'maxMinutes'] as const).map((name) => (
              <Controller
                key={name}
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label={t(`manage.profile.fields.${name}`)}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors[name]?.message}
                    keyboardType="number-pad"
                    className="flex-1"
                  />
                )}
              />
            ))}
          </View>

          <Text variant="caption" className="text-gray-400">
            {t('manage.profile.cuisinesHint')}
          </Text>

          {update.error ? (
            <Text variant="caption" className="text-error-500" accessibilityLiveRegion="polite">
              {toApiError(update.error).message}
            </Text>
          ) : null}

          <Button onPress={save} disabled={!isDirty || update.isPending}>
            {update.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
