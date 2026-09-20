import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ScreenHeader } from '@/components/shared';
import { Button, Text } from '@/components/ui';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { selectItemCount, selectTotalMinor, useCartStore } from '@/stores/cart.store';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

import { CartLineRow } from '../components/CartLineRow';
import { CartSummary } from '../components/CartSummary';
import { InstructionSheet } from '../components/InstructionSheet';

export function CartScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const guard = useNavigationGuard();

  const restaurant = useCartStore((state) => state.restaurant);
  const lines = useCartStore((state) => state.lines);
  const itemCount = useCartStore(selectItemCount);
  const totalMinor = useCartStore(selectTotalMinor);
  const clear = useCartStore((state) => state.clear);
  const setLineInstruction = useCartStore((state) => state.setLineInstruction);

  /**
   * One sheet for the screen, rendered beside the scroll rather than inside a
   * row. Touch responders follow the React tree, not the native one: a Modal
   * that is a child of the ScrollView still has its first tap taken by the
   * ScrollView whenever the keyboard is up, to dismiss it — so Save needed a
   * second tap (#206).
   */
  const [noteLineId, setNoteLineId] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  // The line is kept after closing so the sheet slides out with its text intact.
  const noteLine = lines.find((line) => line.id === noteLineId) ?? null;

  const openNote = (lineId: string) => {
    setNoteLineId(lineId);
    setNoteOpen(true);
  };

  const isEmpty = lines.length === 0 || restaurant === null;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScreenHeader
        title={t('cart.title')}
        showBack={false}
        action={
          isEmpty ? undefined : (
            <View className="flex-row items-center gap-3">
              <Text variant="caption" className="text-gray-500">
                {t('cart.items', { count: itemCount })}
              </Text>
              <Pressable
                // Adding from another Restaurant asks first; wiping the whole
                // Cart is not the one destruction that gets to skip the question.
                onPress={() =>
                  Alert.alert(t('cart.clearTitle'), undefined, [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('cart.clearConfirm'), style: 'destructive', onPress: clear },
                  ])
                }
                accessibilityRole="button"
                accessibilityLabel={t('cart.clear')}
                hitSlop={8}
              >
                <Text variant="caption" className="font-semibold text-gray-500">
                  {t('cart.clear')}
                </Text>
              </Pressable>
            </View>
          )
        }
      />

      {isEmpty ? (
        <View className="flex-1 items-center justify-center px-8">
          <EmptyState message={t('cart.empty')} className="items-center" />
          <Button variant="secondary" onPress={() => router.navigate('/')} className="mt-4">
            {t('cart.browseRestaurants')}
          </Button>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Whose food, and when: what every card on Home says, on the screen
              where the customer decides. Snapshot, like the price — see #203. */}
          <Text variant="label" className="mb-2 text-gray-600">
            {t('cart.header', {
              restaurant: restaurant.name,
              estimate: t('restaurant.deliveryEstimate', {
                min: restaurant.deliveryEstimate.minMinutes,
                max: restaurant.deliveryEstimate.maxMinutes,
              }),
            })}
          </Text>

          {lines.map((line) => (
            <CartLineRow
              key={line.id}
              line={line}
              currency={restaurant.currency}
              onEditNote={() => openNote(line.id)}
            />
          ))}

          {/* The Cart is a tab: without this, adding a second dish means Home
              and finding the Restaurant again (#204). */}
          <Pressable
            onPress={() => guard(() => router.push(`/restaurant/${restaurant.id}`))}
            accessibilityRole="button"
            accessibilityLabel={t('cart.addMore')}
            className="flex-row items-center border-b border-gray-100 py-4 active:opacity-70"
          >
            <View className="h-6 w-6 items-center justify-center rounded-full border-2 border-primary-500">
              <Ionicons name="add" size={14} color={colors.primary[500]} />
            </View>
            <Text variant="label" className="ml-3 flex-1 text-primary-600">
              {t('cart.addMore')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
          </Pressable>

          <CartSummary
            currency={restaurant.currency}
            deliveryFeeMinor={restaurant.deliveryFeeMinor}
          />
        </ScrollView>
      )}

      {/* Below the scroll, not in it: with more than four lines the button
          was off screen, and it named no amount (#205). Same footer as the
          dish page's Add button. */}
      {isEmpty ? null : (
        <View className="border-t border-gray-100 px-4 pb-5 pt-3">
          <Button onPress={() => guard(() => router.push('/checkout'))}>
            {t('cart.checkoutWithTotal', {
              total: formatMoney(totalMinor, restaurant.currency, i18n.language),
            })}
          </Button>
        </View>
      )}

      <InstructionSheet
        visible={noteOpen && noteLine !== null}
        name={noteLine?.name ?? ''}
        initial={noteLine?.instruction ?? ''}
        onCancel={() => setNoteOpen(false)}
        onSave={(next) => {
          if (noteLine) setLineInstruction(noteLine.id, next);
          setNoteOpen(false);
        }}
      />
    </SafeAreaView>
  );
}
