import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

import type { PaymentMethod } from '../types/order.types';
import { PAYMENT_METHODS } from '../types/order.types';

const ICONS: Record<PaymentMethod, 'cash-outline'> = {
  cash_on_delivery: 'cash-outline',
};

type PaymentMethodsProps = {
  /** As served by the restaurant, in the order the server sent them. */
  methods: readonly string[];
  chosen: PaymentMethod;
  onChoose: (method: PaymentMethod) => void;
};

/**
 * The list, rendered from whatever the restaurant offers — t7's answer.
 *
 * Every method is a row, and the shape does not change as the list grows or
 * shrinks. A method this build has no UI for is skipped rather than fatal: the
 * customer still has a way to pay, which is the whole reason the type is a list
 * and not a fixed word (t4).
 *
 * A single method still renders as a row, deliberately. A restaurant that gains
 * a second one should not change the shape of the screen its customers know.
 *
 * Below them sits card, which is not a method — see docs/specs/checkout.md.
 */
export function PaymentMethods({ methods, chosen, onChoose }: PaymentMethodsProps) {
  const { t } = useTranslation();

  const known = methods.filter((method): method is PaymentMethod =>
    (PAYMENT_METHODS as readonly string[]).includes(method),
  );
  const hidden = methods.length - known.length;

  return (
    <View className="gap-3">
      {known.map((method) => {
        const selected = method === chosen;

        return (
          <Pressable
            key={method}
            onPress={() => onChoose(method)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={
              selected
                ? 'flex-row items-center rounded-2xl border-2 border-primary-500 bg-primary-50 p-4'
                : 'flex-row items-center rounded-2xl border border-gray-200 p-4'
            }
          >
            <Ionicons
              name={ICONS[method]}
              size={18}
              color={selected ? colors.primary[600] : colors.gray[500]}
            />
            <Text variant="body" className="ml-3 flex-1 text-gray-900">
              {t(`checkout.method.${method}`)}
            </Text>
            {known.length > 1 ? (
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selected ? colors.primary[600] : colors.gray[300]}
              />
            ) : null}
          </Pressable>
        );
      })}

      <ComingSoonCard />

      {hidden > 0 ? (
        <Text variant="caption" className="text-gray-400">
          {t('checkout.methodUnavailable')}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Card, announced rather than offered.
 *
 * Not a Pressable and not a radio: nothing here is selectable, because there is
 * nothing behind it — no card fields, no tokenisation, no PCI surface. Saying
 * nothing at all would read as "this app cannot take card"; this reads as "not
 * yet", which is the truth. It is copy, and it lives in the app rather than in
 * `PAYMENT_METHODS`, because a restaurant cannot serve a method that cannot
 * take money.
 */
function ComingSoonCard() {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center rounded-2xl border border-dashed border-gray-200 p-4">
      <Ionicons name="card-outline" size={18} color={colors.gray[300]} />
      <Text variant="body" className="ml-3 flex-1 text-gray-400">
        {t('checkout.card.label')}
      </Text>
      <Text variant="caption" className="text-gray-400">
        {t('checkout.card.comingSoon')}
      </Text>
    </View>
  );
}
