import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';
import { initialOf } from '@/utils/initials';

import type { Capability, StaffMember } from '../types/staff.types';

type StaffRowProps = {
  member: StaffMember;
  isBusy: boolean;
  onRevoke: (capability: Capability) => void;
};

export function StaffRow({ member, isBusy, onRevoke }: StaffRowProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-start gap-3 border-b border-gray-100 px-4 py-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-100">
        <Text variant="label" className="text-primary-700">
          {initialOf(member.displayName)}
        </Text>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text variant="bodyMedium" className="text-gray-900" numberOfLines={1}>
            {member.displayName}
          </Text>
          {member.isOwner ? (
            <View className="rounded-full bg-primary-50 px-2 py-0.5">
              <Text variant="caption" className="font-semibold text-primary-700">
                {t('manage.staff.owner')}
              </Text>
            </View>
          ) : null}
        </View>

        <Text variant="caption" className="mt-0.5 text-gray-500">
          {member.phone}
        </Text>

        <View className="mt-2 flex-row flex-wrap gap-2">
          {member.capabilities.map((capability) => (
            <CapabilityChip
              key={capability}
              capability={capability}
              // The owner's kitchen is not the roster's to take (ADR-0013), and
              // the server refuses it. Not offering it is kinder than a 409.
              removable={!(member.isOwner && capability === 'kitchen') && !isBusy}
              onRemove={() => onRevoke(capability)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

type CapabilityChipProps = {
  capability: Capability;
  removable: boolean;
  onRemove: () => void;
};

function CapabilityChip({ capability, removable, onRemove }: CapabilityChipProps) {
  const { t } = useTranslation();
  const label = t(`manage.staff.capability.${capability}`);

  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-gray-100 py-1.5 pl-3 pr-2">
      <Ionicons
        name={capability === 'kitchen' ? 'restaurant-outline' : 'bicycle-outline'}
        size={13}
        color={colors.gray[600]}
      />
      <Text variant="caption" className="font-semibold text-gray-700">
        {label}
      </Text>

      {removable ? (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={t('manage.staff.remove', { capability: label })}
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={16} color={colors.gray[400]} />
        </Pressable>
      ) : (
        <Ionicons name="lock-closed" size={12} color={colors.gray[400]} />
      )}
    </View>
  );
}
