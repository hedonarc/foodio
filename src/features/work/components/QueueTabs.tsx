import { Pressable, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { QueueTab } from '../lib/workQueue';

const TABS: readonly QueueTab[] = ['active', 'done'];

type QueueTabsProps = {
  value: QueueTab;
  onChange: (tab: QueueTab) => void;
};

export function QueueTabs({ value, onChange }: QueueTabsProps) {
  const { t } = useTranslation();

  return (
    <View className="mx-4 mb-2 flex-row rounded-full bg-gray-100 p-1">
      {TABS.map((tab) => {
        const selected = tab === value;

        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={cn(
              'flex-1 items-center rounded-full py-2',
              selected ? 'bg-white' : 'bg-transparent',
            )}
          >
            <Text variant="label" className={selected ? 'text-gray-900' : 'text-gray-500'}>
              {t(`work.queueTabs.${tab}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
