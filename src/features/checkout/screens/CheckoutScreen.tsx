import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, ScreenHeader } from '@/components/shared';
import { Button, Text } from '@/components/ui';
import { PhoneField, updateMe } from '@/features/identity';
import { useRestaurantMenu } from '@/features/menu';
import { useRestaurant } from '@/features/restaurants';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useCartStore } from '@/stores/cart.store';
import { useSessionStore } from '@/stores/session.store';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';
import { generateIdempotencyKey } from '@/utils/idempotencyKey';

import { CheckoutBlockers } from '../components/CheckoutBlockers';
import { PaymentMethods } from '../components/PaymentMethods';
import { useActiveAddress } from '../hooks/useActiveAddress';
import { usePlaceOrder } from '../hooks/useOrders';
import { reviewCheckout } from '../lib/reviewCheckout';
import type { NewOrder, PaymentMethod } from '../types/order.types';

export function CheckoutScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const guard = useNavigationGuard();

  const cartRestaurant = useCartStore((state) => state.restaurant);
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clear);
  const { address } = useActiveAddress();

  const { data: restaurant } = useRestaurant(cartRestaurant?.id);

  /**
   * The number a rider calls about a gate number — contact information, not a
   * credential, since sign-in moved to Google and Apple (backend ADR-0019).
   * Asked for here because this is the first moment it matters, and saved to
   * the person so a second order never asks again.
   */
  const person = useSessionStore((state) => state.person);
  const refreshPerson = useSessionStore((state) => state.refreshPerson);
  const [phoneDraft, setPhoneDraft] = useState('');

  const savePhone = useMutation({
    mutationFn: (phone: string) => updateMe({ phone }),
    onSuccess: async () => {
      await refreshPerson();
    },
  });

  /**
   * The first method the restaurant offers, until the customer says otherwise.
   * Not hardcoded to cash: the list is served (standing constraint 2), so a
   * second method arriving needs no app release.
   */
  const [chosenMethod, setChosenMethod] = useState<PaymentMethod | null>(null);
  const offered = restaurant?.paymentMethods ?? ['cash_on_delivery'];
  const paymentMethod = chosenMethod ?? offered[0] ?? 'cash_on_delivery';
  const setPaymentMethod = setChosenMethod;
  const { data: categories } = useRestaurantMenu(cartRestaurant?.id);
  const placeOrder = usePlaceOrder();

  // One key for the life of this screen: generated at intent, survives every
  // retry of the same tap, thrown away with the screen once the order lands.
  // See backend ADR-0011.
  const [idempotencyKey] = useState(generateIdempotencyKey);

  const currency = cartRestaurant?.currency ?? 'USD';
  const money = (minor: number) => formatMoney(minor, currency, i18n.language);

  const review = reviewCheckout({
    cartRestaurant,
    lines,
    restaurant,
    address,
    phone: person?.phone ?? null,
    currentPrices: (categories ?? []).flatMap((category) => category.menuItems),
    now: new Date(),
  });

  if (!cartRestaurant || lines.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <ScreenHeader title={t('checkout.title')} />
        <EmptyState message={t('cart.empty')} className="flex-1 items-center justify-center px-8" />
      </View>
    );
  }

  const submit = () => {
    if (!review.canPlaceOrder || !address || !restaurant) return;

    const order: NewOrder = {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      currency: restaurant.currency,
      lines: lines.map((line) => ({
        menuItemId: line.menuItemId,
        name: line.name,
        image: line.image,
        unitPriceMinor: line.unitPriceMinor,
        quantity: line.quantity,
        // Absent and empty should not be two ways of saying nothing.
        ...(line.instruction ? { instruction: line.instruction } : {}),
      })),
      subtotalMinor: review.subtotalMinor,
      deliveryFeeMinor: review.deliveryFeeMinor,
      totalMinor: review.totalMinor,
      address,
      paymentMethod,
    };

    placeOrder.mutate(
      { order, idempotencyKey },
      {
        onSuccess: (placed) => {
          clearCart();
          router.replace(`/order/${placed.id}`);
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={t('checkout.title')} />

      <ScrollView contentContainerClassName="px-4 pb-8">
        <Text variant="caption" className="text-gray-400">
          {t('cart.fromRestaurant', { restaurant: cartRestaurant.name })}
        </Text>

        <Section title={t('checkout.deliverTo')}>
          <Pressable
            onPress={() => guard(() => router.push('/address'))}
            accessibilityRole="button"
            className="flex-row items-center rounded-2xl bg-gray-50 p-4 active:bg-gray-100"
          >
            <Ionicons name="location-outline" size={18} color={colors.gray[500]} />
            <View className="ml-3 flex-1">
              {address ? (
                <>
                  <Text variant="label" className="text-gray-900">
                    {address.label}
                  </Text>
                  <Text variant="caption" className="text-gray-500">
                    {[address.line1, address.city, address.postcode].join(', ')}
                  </Text>
                </>
              ) : (
                <Text variant="body" className="text-gray-500">
                  {t('checkout.addAddress')}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
          </Pressable>
        </Section>

        {person !== null && person.phone === null ? (
          <Section title={t('checkout.contactNumber')}>
            <Text variant="caption" className="mb-2 text-gray-500">
              {t('checkout.contactHint')}
            </Text>

            <PhoneField value={phoneDraft} onChange={setPhoneDraft} />

            {savePhone.isError ? <ErrorState error={savePhone.error} className="mt-2" /> : null}

            <Button
              variant="secondary"
              onPress={() => savePhone.mutate(phoneDraft)}
              disabled={savePhone.isPending || phoneDraft.trim() === ''}
              className="mt-3"
            >
              {savePhone.isPending ? t('checkout.savingNumber') : t('checkout.saveNumber')}
            </Button>
          </Section>
        ) : null}

        <Section title={t('checkout.payment')}>
          <PaymentMethods
            methods={restaurant?.paymentMethods ?? ['cash_on_delivery']}
            chosen={paymentMethod}
            onChoose={setPaymentMethod}
          />
        </Section>

        <Section title={t('checkout.summary')}>
          {lines.map((line) => (
            <View key={line.id} className="flex-row justify-between py-1">
              <View className="flex-1 pr-2">
                <Text variant="caption" className="text-gray-600">
                  {line.quantity} × {line.name}
                </Text>
                {line.instruction ? (
                  <Text variant="caption" className="text-gray-400">
                    {line.instruction}
                  </Text>
                ) : null}
              </View>
              <Text variant="caption" className="text-gray-900">
                {money(line.unitPriceMinor * line.quantity)}
              </Text>
            </View>
          ))}

          <View className="mt-3 border-t border-gray-200 pt-3">
            <Row label={t('cart.subtotal')} value={money(review.subtotalMinor)} />
            <Row
              label={t('cart.deliveryFee')}
              value={
                review.deliveryFeeMinor === 0 ? t('cart.free') : money(review.deliveryFeeMinor)
              }
            />
            <Row label={t('cart.total')} value={money(review.totalMinor)} emphasised />
          </View>
        </Section>

        <CheckoutBlockers blockers={review.blockers} currency={currency} />

        {placeOrder.isError ? (
          <ErrorState error={placeOrder.error} onRetry={submit} className="mt-4 px-2" />
        ) : null}

        <Button
          onPress={submit}
          disabled={!review.canPlaceOrder || placeOrder.isPending}
          className="mt-6"
        >
          {placeOrder.isPending
            ? t('checkout.placing')
            : t('checkout.placeOrder', { total: money(review.totalMinor) })}
        </Button>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-5">
      <Text variant="bodyMedium" className="mb-2 text-gray-900">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  emphasised = false,
}: {
  label: string;
  value: string;
  emphasised?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text
        variant={emphasised ? 'bodyMedium' : 'caption'}
        className={emphasised ? 'text-gray-900' : 'text-gray-500'}
      >
        {label}
      </Text>
      <Text
        variant={emphasised ? 'bodyMedium' : 'caption'}
        className={emphasised ? 'text-gray-900' : 'text-gray-600'}
      >
        {value}
      </Text>
    </View>
  );
}
