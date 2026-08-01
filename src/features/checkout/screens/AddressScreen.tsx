import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '@/components/shared';
import { Button, Text, TextField } from '@/components/ui';
import { useAddressStore } from '@/stores/address.store';

import { useCurrentCoordinates } from '../hooks/useCurrentCoordinates';
import type { AddressFormValues } from '../types/address.types';
import { addressFormSchema } from '../types/address.types';

const FIELDS = ['label', 'line1', 'line2', 'city', 'postcode', 'notes'] as const;

const MULTILINE: ReadonlySet<string> = new Set(['notes']);

export function AddressScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const saved = useAddressStore((state) => state.address);
  const setAddress = useAddressStore((state) => state.setAddress);
  const { coordinates, isLocating, errorKey, locate } = useCurrentCoordinates();

  const { control, handleSubmit, formState } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: saved?.label ?? '',
      line1: saved?.line1 ?? '',
      line2: saved?.line2 ?? '',
      city: saved?.city ?? '',
      postcode: saved?.postcode ?? '',
      notes: saved?.notes ?? '',
    },
  });

  const position =
    coordinates ?? (saved ? { latitude: saved.latitude, longitude: saved.longitude } : null);

  const onSubmit = (values: AddressFormValues) => {
    if (!position) return;

    setAddress({ ...values, ...position });
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={t('address.title')} />

      <ScrollView contentContainerClassName="gap-4 px-4 pb-8" keyboardShouldPersistTaps="handled">
        {FIELDS.map((name) => (
          <Controller
            key={name}
            control={control}
            name={name}
            render={({ field, fieldState }) => (
              <TextField
                label={t(`address.fields.${name}`)}
                value={field.value ?? ''}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                multiline={MULTILINE.has(name)}
                autoCapitalize={name === 'postcode' ? 'characters' : 'words'}
                error={fieldState.error ? t(`address.errors.${name}`) : undefined}
              />
            )}
          />
        ))}

        <View className="mt-2 gap-2 rounded-2xl bg-gray-50 p-4">
          <Text variant="label" className="text-gray-900">
            {t('address.locationTitle')}
          </Text>
          <Text variant="caption" className="text-gray-500">
            {position
              ? t('address.locationSet', {
                  latitude: position.latitude.toFixed(4),
                  longitude: position.longitude.toFixed(4),
                })
              : t('address.locationWhy')}
          </Text>
          {errorKey ? (
            <Text variant="caption" className="text-error-500">
              {t(errorKey)}
            </Text>
          ) : null}
          <Button variant="secondary" onPress={() => void locate()} disabled={isLocating}>
            {isLocating ? t('address.locating') : t('address.useMyLocation')}
          </Button>
        </View>

        <Button
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={!position || formState.isSubmitting}
        >
          {t('address.save')}
        </Button>

        {position ? null : (
          <Text variant="caption" className="text-center text-gray-400">
            {t('address.needsLocation')}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
