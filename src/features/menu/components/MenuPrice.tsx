import { Text } from '@/components/ui';

type MenuPriceProps = {
  price: number;
};

export function MenuPrice({ price }: MenuPriceProps) {
  return (
    <Text variant="bodyMedium" className="text-gray-900">
      ${price.toFixed(2)}
    </Text>
  );
}
