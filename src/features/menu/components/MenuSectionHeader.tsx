import { Text } from '@/components/ui';

type MenuSectionHeaderProps = {
  title: string;
};

export function MenuSectionHeader({ title }: MenuSectionHeaderProps) {
  return (
    <Text variant="bodyMedium" className="mb-2 mt-4 text-gray-900">
      {title}
    </Text>
  );
}
