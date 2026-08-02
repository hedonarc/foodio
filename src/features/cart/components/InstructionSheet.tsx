import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Button, Text, TextField } from '@/components/ui';

const INSTRUCTION_MAX = 140;

type InstructionSheetProps = {
  visible: boolean;
  name: string;
  initial: string;
  onCancel: () => void;
  onSave: (instruction: string) => void;
};

/** Editing a note is a small enough act to stay on the cart screen. */
export function InstructionSheet({
  visible,
  name,
  initial,
  onCancel,
  onSave,
}: InstructionSheetProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(initial);

  // Reopening on a line whose note changed elsewhere must not show the old one.
  useEffect(() => {
    if (visible) setDraft(initial);
  }, [visible, initial]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable className="flex-1 bg-black/40" onPress={onCancel} accessibilityRole="button" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="rounded-t-3xl bg-white px-4 pb-8 pt-5">
          <Text variant="subheading" className="text-gray-900">
            {name}
          </Text>

          <TextField
            label={t('menu.instructionLabel')}
            placeholder={t('menu.instructionPlaceholder')}
            value={draft}
            onChangeText={setDraft}
            maxLength={INSTRUCTION_MAX}
            multiline
            autoFocus
            className="mt-4"
          />

          <View className="mt-5 flex-row gap-3">
            <Button variant="ghost" onPress={onCancel} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button onPress={() => onSave(draft)} className="flex-1">
              {t('common.save')}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
