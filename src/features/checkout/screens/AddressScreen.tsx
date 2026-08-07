import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState, ScreenHeader } from '@/components/shared';
import { Button, Text, TextField } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useActiveAddressStore } from '@/stores/activeAddress.store';
import { colors } from '@/theme';
import type { Coordinates } from '@/utils/distance';

import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
} from '../hooks/useAddresses';
import { useCurrentCoordinates } from '../hooks/useCurrentCoordinates';
import { resolveActiveAddress } from '../lib/activeAddress';
import type { AddressFormValues, SavedAddress } from '../types/address.types';
import { addressFormSchema } from '../types/address.types';

const FIELDS = ['label', 'line1', 'line2', 'city', 'postcode', 'notes'] as const;

const MULTILINE: ReadonlySet<string> = new Set(['notes']);

/** List mode is home; a target here switches to the add/edit form. */
type FormTarget = { mode: 'create' } | { mode: 'edit'; address: SavedAddress };

/**
 * Two modes sharing one screen: a list of saved addresses to pick from, and
 * the add/edit form. See issue #72 — this replaces the single local draft
 * `useAddressStore` used to hold.
 */
export function AddressScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);

  const { data: addresses, isPending, error, refetch } = useAddresses();
  const activeAddressId = useActiveAddressStore((state) => state.activeAddressId);
  const selectAddress = useActiveAddressStore((state) => state.selectAddress);

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  if (formTarget) {
    return (
      <AddressForm
        target={formTarget}
        isSaving={createAddress.isPending || updateAddress.isPending}
        saveError={formTarget.mode === 'create' ? createAddress.error : updateAddress.error}
        onCancel={() => setFormTarget(null)}
        onSubmit={(values, position) => {
          const address = { ...values, ...position };

          if (formTarget.mode === 'create') {
            createAddress.mutate(address, {
              // The address you just added is presumably the one you meant to use.
              onSuccess: (saved) => {
                selectAddress(saved.id);
                setFormTarget(null);
              },
            });
            return;
          }

          updateAddress.mutate(
            { addressId: formTarget.address.id, address },
            { onSuccess: () => setFormTarget(null) },
          );
        }}
      />
    );
  }

  const activeAddress = resolveActiveAddress(addresses ?? [], activeAddressId);

  const confirmDelete = (address: SavedAddress) => {
    Alert.alert(
      t('address.deleteConfirm.title'),
      t('address.deleteConfirm.message', { label: address.label }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('address.deleteConfirm.confirm'),
          style: 'destructive',
          onPress: () => deleteAddress.mutate(address.id),
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={t('address.title')} />

      {isPending ? <LoadingState className="flex-1 items-center justify-center" /> : null}

      {error ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          className="flex-1 items-center justify-center px-8"
        />
      ) : null}

      {!isPending && !error ? (
        <ScrollView contentContainerClassName="gap-3 px-4 pb-8">
          {deleteAddress.isError ? <ErrorState error={deleteAddress.error} /> : null}

          {addresses && addresses.length === 0 ? (
            <EmptyState message={t('address.list.empty')} className="items-center px-4 py-10" />
          ) : null}

          {(addresses ?? []).map((address) => (
            <AddressRow
              key={address.id}
              address={address}
              isActive={address.id === activeAddress?.id}
              onSelect={() => {
                selectAddress(address.id);
                router.back();
              }}
              onEdit={() => setFormTarget({ mode: 'edit', address })}
              onDelete={() => confirmDelete(address)}
            />
          ))}

          <Button variant="secondary" onPress={() => setFormTarget({ mode: 'create' })}>
            {t('address.addNew')}
          </Button>
        </ScrollView>
      ) : null}
    </View>
  );
}

type AddressRowProps = {
  address: SavedAddress;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function AddressRow({ address, isActive, onSelect, onEdit, onDelete }: AddressRowProps) {
  const { t } = useTranslation();

  return (
    <View
      className={cn(
        'flex-row items-center rounded-2xl border p-4',
        isActive ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-gray-50',
      )}
    >
      <Pressable
        onPress={onSelect}
        accessibilityRole="button"
        accessibilityLabel={t('address.list.select', { label: address.label })}
        className="flex-1 flex-row items-center active:opacity-70"
      >
        <Ionicons
          name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
          size={20}
          color={isActive ? colors.primary[500] : colors.gray[300]}
        />
        <View className="ml-3 flex-1">
          <Text variant="label" className="text-gray-900">
            {address.label}
          </Text>
          <Text variant="caption" className="text-gray-500" numberOfLines={1}>
            {[address.line1, address.city, address.postcode].join(', ')}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={onEdit}
        accessibilityRole="button"
        accessibilityLabel={t('address.list.edit', { label: address.label })}
        hitSlop={8}
        className="ml-2 h-8 w-8 items-center justify-center"
      >
        <Ionicons name="pencil-outline" size={18} color={colors.gray[500]} />
      </Pressable>

      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={t('address.list.delete', { label: address.label })}
        hitSlop={8}
        className="ml-1 h-8 w-8 items-center justify-center"
      >
        <Ionicons name="trash-outline" size={18} color={colors.error[500]} />
      </Pressable>
    </View>
  );
}

type AddressFormProps = {
  target: FormTarget;
  isSaving: boolean;
  saveError: unknown;
  onCancel: () => void;
  onSubmit: (values: AddressFormValues, position: Coordinates) => void;
};

function AddressForm({ target, isSaving, saveError, onCancel, onSubmit }: AddressFormProps) {
  const { t } = useTranslation();

  const editing = target.mode === 'edit' ? target.address : null;
  const { coordinates, isLocating, errorKey, locate } = useCurrentCoordinates();

  const { control, handleSubmit, formState } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: editing?.label ?? '',
      line1: editing?.line1 ?? '',
      line2: editing?.line2 ?? '',
      city: editing?.city ?? '',
      postcode: editing?.postcode ?? '',
      notes: editing?.notes ?? '',
    },
  });

  const position: Coordinates | null =
    coordinates ?? (editing ? { latitude: editing.latitude, longitude: editing.longitude } : null);

  const submit = (values: AddressFormValues) => {
    if (!position) return;
    onSubmit(values, position);
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

        {saveError ? <ErrorState error={saveError} /> : null}

        <Button
          onPress={() => void handleSubmit(submit)()}
          disabled={!position || formState.isSubmitting || isSaving}
        >
          {isSaving ? t('address.saving') : t('address.save')}
        </Button>

        <Button variant="ghost" onPress={onCancel}>
          {t('common.cancel')}
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
