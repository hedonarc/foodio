import { Pressable, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { ErrorState, LoadingState, ScreenHeader } from '@/components/shared';
import { Text } from '@/components/ui';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';

import { createSession } from '../api/identity.api';
import { usePeople } from '../hooks/usePeople';
import type { Person } from '../types/identity.types';

/**
 * A dev affordance that pretends nothing. A password field would promise
 * verification the server cannot do; choosing who to be promises only that
 * the server, not the client, issues the session. See issue #55.
 */
export function IdentityPickerScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: people, isPending, error, refetch } = usePeople();
  const signIn = useSessionStore((state) => state.signIn);

  const choose = async (person: Person) => {
    const session = await createSession(person.id);
    await signIn(session.token, session.person);
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={t('identity.signIn')} />

      {isPending ? <LoadingState className="flex-1 items-center justify-center" /> : null}
      {error ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          className="flex-1 items-center justify-center px-8"
        />
      ) : null}

      {people ? (
        <ScrollView contentContainerClassName="px-4 pb-8">
          <Text variant="caption" className="mb-3 text-gray-500">
            {t('identity.pickerHint')}
          </Text>
          {people.map((person) => (
            <Pressable
              key={person.id}
              onPress={() => void choose(person)}
              accessibilityRole="button"
              accessibilityLabel={person.displayName}
              className="mb-2 flex-row items-center rounded-2xl border border-gray-100 p-4 active:bg-gray-50"
            >
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-500">
                <Text variant="label" className="text-white">
                  {person.displayName.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text variant="bodyMedium" className="text-gray-900">
                  {person.displayName}
                </Text>
                <Text variant="caption" className="mt-0.5 text-gray-500">
                  {describe(person, t)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

/** Entitlements are the whole reason to pick one person over another. */
function describe(person: Person, t: (key: string) => string): string {
  if (person.entitlements.length === 0) return t('identity.customerOnly');

  return person.entitlements
    .map((entitlement) => `${entitlement.restaurantId} · ${entitlement.capabilities.join(', ')}`)
    .join('  ·  ');
}
