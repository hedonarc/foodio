import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiError } from '@/api/errors';
import { ScreenHeader } from '@/components/shared';
import { Button, Text, TextField } from '@/components/ui';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';

import type { CodePreview } from '../api/join.api';
import { previewJoinCode, redeemJoinCode } from '../api/join.api';
import { isCompleteCode, normaliseCode } from '../lib/code';

/**
 * The other half of a joining code: someone who was handed one, typing it in.
 *
 * Preview then redeem, deliberately in two steps. Redeeming is irreversible and
 * spends the code, so nobody should discover which restaurant they have joined
 * *after* joining it — the confirmation is the invited party's consent, which
 * is the one thing ADR-0014 kept from the invitation idea it rejected.
 */
export function JoinRestaurantScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const refreshPerson = useSessionStore((state) => state.refreshPerson);

  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<CodePreview | null>(null);

  const look = useMutation({
    mutationFn: previewJoinCode,
    onSuccess: setPreview,
  });

  const join = useMutation({
    mutationFn: redeemJoinCode,
    // Entitlements are resolved per request, so the app only learns about the
    // new one by asking. Without this the switcher would not show it until the
    // next launch.
    onSuccess: async () => {
      await refreshPerson();
    },
  });

  const failure = look.error ?? join.error;

  if (join.isSuccess && preview) {
    return <Joined preview={preview} onDone={() => router.back()} />;
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader title={t('join.title')} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="gap-4 px-4 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="body" className="text-gray-500">
            {t('join.subtitle')}
          </Text>

          {/*
            Deliberately no `maxLength`: it caps the *raw* text, so a pasted
            "GYMH-NU" is cut to "GYMH-N" before the dash is stripped and a
            character is silently lost. `normaliseCode` caps it afterwards.
          */}
          <TextField
            label={t('join.codeLabel')}
            value={code}
            onChangeText={(next) => {
              setCode(normaliseCode(next));
              // A new code makes any previous answer stale, right or wrong.
              setPreview(null);
              look.reset();
              join.reset();
            }}
            placeholder={t('join.codePlaceholder')}
            autoCapitalize="characters"
            autoCorrect={false}
            className="[&>*]:tracking-[4px]"
          />

          {preview ? (
            <View className="gap-3 rounded-2xl bg-primary-50 p-4">
              <Text variant="caption" className="text-primary-700">
                {t('join.confirmPrompt')}
              </Text>
              <Text variant="subheading" className="text-gray-900">
                {preview.restaurantName}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <Ionicons
                  name={preview.capability === 'kitchen' ? 'restaurant-outline' : 'bicycle-outline'}
                  size={14}
                  color={colors.gray[600]}
                />
                <Text variant="caption" className="text-gray-700">
                  {t(`join.as.${preview.capability}`)}
                </Text>
              </View>
            </View>
          ) : null}

          {failure ? (
            <Text variant="caption" className="text-error-500" accessibilityLiveRegion="polite">
              {toApiError(failure).message}
            </Text>
          ) : null}

          {preview ? (
            <Button onPress={() => join.mutate(code)} disabled={join.isPending}>
              {join.isPending ? t('join.joining') : t('join.confirm')}
            </Button>
          ) : (
            <Button
              onPress={() => look.mutate(code)}
              disabled={!isCompleteCode(code) || look.isPending}
            >
              {look.isPending ? t('join.checking') : t('join.check')}
            </Button>
          )}

          <Text variant="caption" className="text-gray-400">
            {t('join.hint')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Joined({ preview, onDone }: { preview: CodePreview; onDone: () => void }) {
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
          <Ionicons name="checkmark" size={30} color={colors.success[500]} />
        </View>

        <Text variant="subheading" className="text-center text-gray-900">
          {t('join.joinedTitle', { restaurant: preview.restaurantName })}
        </Text>

        {/* Says where to go next, because nothing on screen changes by itself. */}
        <Text variant="body" className="text-center text-gray-500">
          {t(`join.joinedBody.${preview.capability}`)}
        </Text>
      </View>

      <View className="px-4 pb-6">
        <Button onPress={onDone}>{t('common.done')}</Button>
      </View>
    </SafeAreaView>
  );
}
