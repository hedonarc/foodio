import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Button, Text, TextField } from '@/components/ui';
import { cn } from '@/lib/cn';

import { composeNote } from '../lib/workQueue';

/** Composed reason + detail stays under the backend's 280-char note cap. */
const NOTE_MAX = 200;

type TransitionSheetProps<Reason extends string> = {
  visible: boolean;
  title: string;
  message?: string;
  /** When present, confirming requires picking one; it becomes the note. */
  reasons?: readonly Reason[];
  labelForReason?: (reason: Reason) => string;
  confirmLabel: string;
  /** `note` is the customer-facing reason line, or undefined for plain confirms. */
  onConfirm: (note?: string) => void;
  onCancel: () => void;
};

/**
 * One confirm sheet for every deliberate transition: reject, delivered
 * (cash collected), couldn't deliver. Reasons are one tap, the note optional —
 * a mandatory essay teaches kitchens to hate the app.
 */
export function TransitionSheet<Reason extends string>({
  visible,
  title,
  message,
  reasons,
  labelForReason,
  confirmLabel,
  onConfirm,
  onCancel,
}: TransitionSheetProps<Reason>) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<Reason | null>(null);
  const [detail, setDetail] = useState('');

  // Reopening for another order must not carry the previous choice.
  useEffect(() => {
    if (visible) {
      setReason(null);
      setDetail('');
    }
  }, [visible]);

  const needsReason = reasons !== undefined && reasons.length > 0;

  const confirm = () => {
    if (!needsReason) {
      onConfirm();
      return;
    }
    if (reason === null || labelForReason === undefined) return;
    onConfirm(composeNote(labelForReason(reason), detail));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable className="flex-1 bg-black/40" onPress={onCancel} accessibilityRole="button" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="rounded-t-3xl bg-white px-4 pb-8 pt-5">
          <Text variant="subheading" className="text-gray-900">
            {title}
          </Text>
          {message ? (
            <Text variant="body" className="mt-1 text-gray-500">
              {message}
            </Text>
          ) : null}

          {needsReason && labelForReason ? (
            <View className="mt-4 flex-row flex-wrap gap-2">
              {reasons.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setReason(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: reason === option }}
                  className={cn(
                    'rounded-full border px-4 py-2',
                    reason === option
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white',
                  )}
                >
                  <Text
                    variant="label"
                    className={reason === option ? 'text-primary-700' : 'text-gray-700'}
                  >
                    {labelForReason(option)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {needsReason ? (
            <TextField
              label={t('work.noteLabel')}
              placeholder={t('work.notePlaceholder')}
              value={detail}
              onChangeText={setDetail}
              maxLength={NOTE_MAX}
              multiline
              className="mt-4"
            />
          ) : null}

          <View className="mt-5 flex-row gap-3">
            <Button variant="ghost" onPress={onCancel} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button onPress={confirm} disabled={needsReason && reason === null} className="flex-1">
              {confirmLabel}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
