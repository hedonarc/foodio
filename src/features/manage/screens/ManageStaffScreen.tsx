import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { EmptyState, ErrorState, LoadingState, ScreenHeader } from '@/components/shared';
import { Button, Text } from '@/components/ui';
import { useRestaurants } from '@/features/restaurants';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';

import { JoinCodeSheet } from '../components/JoinCodeSheet';
import { StaffRow } from '../components/StaffRow';
import { useMintJoinCode, useRevokeCapability, useStaff } from '../hooks/useStaff';
import type { Capability, JoinCode, StaffMember } from '../types/staff.types';

export function ManageStaffScreen() {
  const { t } = useTranslation();

  const role = useSessionStore((state) => state.role);
  const restaurantId = role.kind === 'kitchen' ? role.restaurantId : '';
  const personId = useSessionStore((state) => state.person?.id);

  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.find((entry) => entry.id === restaurantId);

  const { data: staff, isPending, error, refetch } = useStaff(restaurantId);
  const revoke = useRevokeCapability(restaurantId);
  const mint = useMintJoinCode();

  const [minted, setMinted] = useState<JoinCode | null>(null);

  /** Only the Owner may add another Kitchen holder — ADR-0014. */
  const isOwner = staff?.some((member) => member.isOwner && member.personId === personId) ?? false;

  const addSomeone = (capability: Capability) => {
    mint.mutate(
      { restaurantId, capability },
      {
        onSuccess: setMinted,
        onError: (cause) => Alert.alert(t('manage.staff.addFailed'), toApiError(cause).message),
      },
    );
  };

  const confirmRevoke = (member: StaffMember, capability: Capability) => {
    Alert.alert(
      t('manage.staff.confirmRemoveTitle'),
      t('manage.staff.confirmRemoveBody', {
        name: member.displayName,
        capability: t(`manage.staff.capability.${capability}`),
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('manage.staff.removeAction'),
          style: 'destructive',
          onPress: () =>
            revoke.mutate(
              { restaurantId, personId: member.personId, capability },
              {
                // The server owns the three refusals — the owner's kitchen, the
                // last kitchen, a capability never held. Show what it said.
                onError: (cause) =>
                  Alert.alert(t('manage.staff.removeFailed'), toApiError(cause).message),
              },
            ),
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t('manage.staff.title')} />

      {isPending ? <LoadingState className="flex-1 items-center justify-center" /> : null}
      {error ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          className="flex-1 items-center justify-center px-8"
        />
      ) : null}

      {staff ? (
        <ScrollView contentContainerClassName="pb-10">
          <View className="px-4 pb-2">
            <Text variant="caption" className="text-gray-500">
              {t('manage.staff.subtitle')}
            </Text>
          </View>

          {staff.map((member) => (
            <StaffRow
              key={member.personId}
              member={member}
              isBusy={revoke.isPending}
              onRevoke={(capability) => confirmRevoke(member, capability)}
            />
          ))}

          {staff.length === 0 ? <EmptyState message={t('manage.staff.empty')} /> : null}

          <View className="gap-3 px-4 pt-5">
            <Text variant="label" className="text-gray-500">
              {t('manage.staff.addTitle')}
            </Text>

            <Button
              onPress={() => addSomeone('delivery')}
              disabled={mint.isPending}
              icon={<Ionicons name="bicycle-outline" size={16} color="white" />}
            >
              {t('manage.staff.addRider')}
            </Button>

            <Button
              variant="secondary"
              onPress={() => addSomeone('kitchen')}
              // Refused by the server for anyone but the Owner. Disabling it is
              // clearer than letting a staff member tap into a 403.
              disabled={mint.isPending || !isOwner}
              icon={<Ionicons name="restaurant-outline" size={16} color={colors.gray[700]} />}
            >
              {t('manage.staff.addKitchen')}
            </Button>

            <Text variant="caption" className="text-gray-400">
              {t(isOwner ? 'manage.staff.addHint' : 'manage.staff.ownerOnlyHint')}
            </Text>
          </View>
        </ScrollView>
      ) : null}

      <JoinCodeSheet
        code={minted}
        restaurantName={restaurant?.name ?? ''}
        onClose={() => setMinted(null)}
      />
    </SafeAreaView>
  );
}
