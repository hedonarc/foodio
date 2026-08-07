import { useState } from 'react';
import { View } from 'react-native';

import { useRouter } from 'expo-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ErrorState, ScreenHeader } from '@/components/shared';
import { Button, Text, TextField } from '@/components/ui';
import { useSessionStore } from '@/stores/session.store';

import { requestOtp, verifyOtp } from '../api/identity.api';
import type { OtpRequestFormValues, OtpVerifyFormValues } from '../types/identity.types';
import { otpRequestFormSchema, otpVerifyFormSchema } from '../types/identity.types';

/**
 * Phone plus a one-time code — the only account creation this app has. See
 * backend ADR-0007: phone rather than email fits a market where kitchen and
 * delivery staff share one device and a password is a support burden.
 */
export function IdentityPickerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const signIn = useSessionStore((state) => state.signIn);

  const [phone, setPhone] = useState<string | null>(null);

  const phoneForm = useForm<OtpRequestFormValues>({
    resolver: zodResolver(otpRequestFormSchema),
    defaultValues: { phone: '' },
  });

  const codeForm = useForm<OtpVerifyFormValues>({
    resolver: zodResolver(otpVerifyFormSchema),
    defaultValues: { phone: '', code: '', displayName: '' },
  });

  const sendCode = useMutation({
    mutationFn: requestOtp,
    onSuccess: (_data, sentPhone) => {
      setPhone(sentPhone);
      codeForm.reset({ phone: sentPhone, code: '', displayName: '' });
    },
  });

  const verify = useMutation({
    mutationFn: (values: OtpVerifyFormValues) =>
      verifyOtp(values.phone, values.code, values.displayName || undefined),
    onSuccess: async (session) => {
      await signIn(session);
      router.back();
    },
  });

  if (phone === null) {
    return (
      <View className="flex-1 bg-white">
        <ScreenHeader title={t('identity.signIn')} />

        <View className="gap-4 px-4 pb-8">
          <Text variant="caption" className="text-gray-500">
            {t('identity.phoneHint')}
          </Text>

          <Controller
            control={phoneForm.control}
            name="phone"
            render={({ field, fieldState }) => (
              <TextField
                label={t('identity.phoneLabel')}
                placeholder={t('identity.phonePlaceholder')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="phone-pad"
                autoComplete="tel"
                error={fieldState.error ? t('identity.errors.phone') : undefined}
              />
            )}
          />

          {sendCode.isError ? <ErrorState error={sendCode.error} /> : null}

          <Button
            onPress={() => void phoneForm.handleSubmit((values) => sendCode.mutate(values.phone))()}
            disabled={sendCode.isPending}
          >
            {sendCode.isPending ? t('identity.sendingCode') : t('identity.sendCode')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={t('identity.signIn')} />

      <View className="gap-4 px-4 pb-8">
        <Text variant="caption" className="text-gray-500">
          {t('identity.codeHint', { phone })}
        </Text>

        <Controller
          control={codeForm.control}
          name="code"
          render={({ field, fieldState }) => (
            <TextField
              label={t('identity.codeLabel')}
              placeholder={t('identity.codePlaceholder')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="number-pad"
              maxLength={6}
              error={fieldState.error ? t('identity.errors.code') : undefined}
            />
          )}
        />

        <Controller
          control={codeForm.control}
          name="displayName"
          render={({ field }) => (
            <TextField
              label={t('identity.nameLabel')}
              placeholder={t('identity.namePlaceholder')}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="words"
            />
          )}
        />

        {verify.isError ? <ErrorState error={verify.error} /> : null}

        <Button
          onPress={() => void codeForm.handleSubmit((values) => verify.mutate(values))()}
          disabled={verify.isPending}
        >
          {verify.isPending ? t('identity.verifying') : t('identity.verify')}
        </Button>

        <Button
          variant="ghost"
          onPress={() => {
            setPhone(null);
            verify.reset();
          }}
        >
          {t('identity.changeNumber')}
        </Button>

        <Button
          variant="ghost"
          onPress={() => sendCode.mutate(phone)}
          disabled={sendCode.isPending}
        >
          {t('identity.resendCode')}
        </Button>
      </View>
    </View>
  );
}
