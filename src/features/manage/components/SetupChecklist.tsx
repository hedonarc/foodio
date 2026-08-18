import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

import type { ChecklistStep } from '../lib/checklist';
import { remainingCount } from '../lib/checklist';

/**
 * What is left before this restaurant is worth showing anyone.
 *
 * Shown only while it is still `onboarding`, and it teaches the hub rather
 * than duplicating it: every step opens the same screen used forever after,
 * so there is one menu editor and one hours editor, never two (t5).
 */
export function SetupChecklist({ steps }: { steps: ChecklistStep[] }) {
  const { t } = useTranslation();
  const router = useRouter();

  const left = remainingCount(steps);

  return (
    <View className="mx-4 mb-4 overflow-hidden rounded-2xl border border-gray-200">
      <View className="gap-1 border-b border-gray-100 bg-primary-50 px-4 py-3">
        <Text variant="label" className="text-primary-700">
          {t('manage.checklist.title')}
        </Text>
        <Text variant="caption" className="text-gray-600">
          {t('manage.checklist.remaining', { count: left })}
        </Text>
      </View>

      {steps.map((step) => (
        <Pressable
          key={step.key}
          onPress={() => router.push(step.route)}
          accessibilityRole="button"
          accessibilityState={{ checked: step.done }}
          className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 active:bg-gray-50"
        >
          <Ionicons
            name={step.done ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={step.done ? colors.success[500] : colors.gray[300]}
          />

          <Text
            variant="caption"
            className={step.done ? 'flex-1 text-gray-400 line-through' : 'flex-1 text-gray-800'}
          >
            {t(`manage.checklist.steps.${step.key}`)}
          </Text>

          {step.required && !step.done ? (
            <View className="rounded-full bg-warning-100 px-2 py-0.5">
              <Text variant="caption" className="font-semibold text-warning-700">
                {t('manage.checklist.required')}
              </Text>
            </View>
          ) : null}

          <Ionicons name="chevron-forward" size={16} color={colors.gray[300]} />
        </Pressable>
      ))}
    </View>
  );
}
