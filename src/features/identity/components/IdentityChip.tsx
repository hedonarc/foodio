import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';

import type { ActiveRole } from '../types/identity.types';
import { roleOptionsFor, sameRole } from '../types/identity.types';

/**
 * Identity, not a mode toggle. Present for everyone: most people have nothing
 * to switch to, but they still need somewhere to sign out — and iOS keeps
 * Secure Store across uninstall, so sign-out is required. See issue #58.
 */
export function IdentityChip() {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const person = useSessionStore((state) => state.person);

  if (!person) {
    return (
      <Pressable
        onPress={() => router.push('/sign-in')}
        accessibilityRole="button"
        accessibilityLabel={t('identity.signIn')}
        hitSlop={8}
        className="h-11 justify-center rounded-2xl bg-gray-100 px-3 active:bg-gray-200"
      >
        <Text variant="caption" className="font-semibold text-gray-700">
          {t('identity.signIn')}
        </Text>
      </Pressable>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={person.displayName}
        hitSlop={8}
        className="h-11 w-11 items-center justify-center rounded-full bg-primary-500 active:bg-primary-600"
      >
        <Text variant="label" className="text-white">
          {person.displayName.charAt(0)}
        </Text>
      </Pressable>
      <IdentityMenu visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

function IdentityMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const person = useSessionStore((state) => state.person);
  const role = useSessionStore((state) => state.role);
  const setRole = useSessionStore((state) => state.setRole);
  const signOut = useSessionStore((state) => state.signOut);

  // Names, not ids: "Taco Fiesta · serving" is a place, "rest-1" is a slug.
  const { data: restaurants } = useRestaurants();
  const nameOf = (id: string) =>
    restaurants?.find((restaurant) => restaurant.id === id)?.name ?? id;

  if (!person) return null;

  const choose = async (next: ActiveRole) => {
    await setRole(next);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/30" onPress={onClose} accessibilityRole="button" />
      <View
        style={{ top: insets.top + 56 }}
        className="absolute right-4 w-64 overflow-hidden rounded-2xl bg-white shadow-lg"
      >
        <View className="border-b border-gray-100 px-4 py-3">
          <Text variant="caption" className="text-gray-400">
            {t('identity.signedInAs')}
          </Text>
          <Text variant="bodyMedium" className="mt-0.5 text-gray-900">
            {person.displayName}
          </Text>
        </View>

        {roleOptionsFor(person).map((option) => {
          const isCurrent = sameRole(option.role, role);
          const label =
            option.role.kind === 'customer'
              ? t('identity.ordering')
              : `${nameOf(option.restaurantId ?? '')} · ${t(`identity.${option.role.kind === 'serve' ? 'serving' : 'delivering'}`)}`;

          return (
            <Pressable
              key={`${option.role.kind}-${option.restaurantId ?? 'me'}`}
              onPress={() => void choose(option.role)}
              accessibilityRole="button"
              accessibilityState={{ selected: isCurrent }}
              accessibilityLabel={label}
              className={
                isCurrent
                  ? 'flex-row items-center bg-primary-50 px-4 py-3'
                  : 'flex-row items-center px-4 py-3 active:bg-gray-50'
              }
            >
              <Ionicons
                name={isCurrent ? 'checkmark' : iconFor(option.role)}
                size={16}
                color={isCurrent ? colors.primary[600] : colors.gray[500]}
              />
              <Text
                variant="caption"
                className={
                  isCurrent ? 'ml-2.5 flex-1 text-primary-700' : 'ml-2.5 flex-1 text-gray-700'
                }
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => void signOut().then(onClose)}
          accessibilityRole="button"
          accessibilityLabel={t('identity.signOut')}
          className="flex-row items-center border-t border-gray-100 px-4 py-3 active:bg-gray-50"
        >
          <Ionicons name="log-out-outline" size={16} color={colors.gray[500]} />
          <Text variant="caption" className="ml-2.5 text-gray-700">
            {t('identity.signOut')}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const iconFor = (role: ActiveRole) =>
  role.kind === 'serve'
    ? 'restaurant-outline'
    : role.kind === 'deliver'
      ? 'bicycle-outline'
      : 'bag-handle-outline';
