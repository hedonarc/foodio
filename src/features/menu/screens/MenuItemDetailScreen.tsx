import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { ErrorState, LoadingState, ScreenHeader } from '@/components/shared';
import { Button, Text, TextField } from '@/components/ui';
// Deep import: the restaurants barrel reaches back into this feature.
import { useRestaurant } from '@/features/restaurants/hooks/useRestaurant';
import { selectIsFromOtherRestaurant, useCartStore } from '@/stores/cart.store';
import { colors } from '@/theme';
import { formatMoney } from '@/utils/currency';

import { useMenuItem } from '../hooks/useMenuItem';
import type { MenuItem } from '../types/menu.types';

const INSTRUCTION_MAX = 140;

export function MenuItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: item, isPending, error, refetch } = useMenuItem(id);
  const { data: restaurant } = useRestaurant(item?.restaurantId);

  if (isPending)
    return (
      <Shell>
        <LoadingState className="flex-1 items-center justify-center" />
      </Shell>
    );

  if (error) {
    return (
      <Shell>
        <ErrorState
          error={error}
          onRetry={refetch}
          className="flex-1 items-center justify-center px-8"
        />
      </Shell>
    );
  }

  if (!item || !restaurant)
    return (
      <Shell>
        <LoadingState className="flex-1 items-center justify-center" />
      </Shell>
    );

  return <Loaded item={item} currency={restaurant.currency} restaurant={restaurant} />;
}

type LoadedProps = {
  item: MenuItem;
  currency: string;
  restaurant: { id: string; name: string; currency: string; deliveryFeeMinor: number };
};

function Loaded({ item, currency, restaurant }: LoadedProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [instruction, setInstruction] = useState('');

  const addItem = useCartStore((state) => state.addItem);
  const heldByOtherRestaurant = useCartStore(selectIsFromOtherRestaurant(restaurant.id));
  const currentRestaurantName = useCartStore((state) => state.restaurant?.name);

  const addable = {
    id: item.id,
    name: item.name,
    image: item.image,
    priceMinor: item.priceMinor,
  };

  const commit = () => {
    addItem(restaurant, addable, { instruction, quantity });
    router.back();
  };

  const handleAdd = () => {
    if (!heldByOtherRestaurant) {
      commit();
      return;
    }

    // Same one-restaurant-per-cart warning the menu row gives.
    Alert.alert(
      t('cart.replaceTitle'),
      t('cart.replaceMessage', { restaurant: currentRestaurantName ?? '' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('cart.replaceConfirm'), style: 'destructive', onPress: commit },
      ],
    );
  };

  return (
    <Shell title={item.name}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="h-56 w-full bg-gray-200">
          <Image
            source={{ uri: item.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
            accessibilityIgnoresInvertColors
          />
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row items-start">
            <Text variant="subheading" className="flex-1 text-gray-900">
              {item.name}
            </Text>
            <Text variant="subheading" className="ml-3 text-gray-900">
              {formatMoney(item.priceMinor, currency, i18n.language)}
            </Text>
          </View>

          {item.rating !== undefined ? (
            <View className="mt-1 flex-row items-center">
              <Ionicons name="star" size={13} color={colors.warning[500]} />
              <Text variant="caption" className="ml-1 font-semibold text-warning-700">
                {item.rating.toFixed(1)}
              </Text>
            </View>
          ) : null}

          <Text variant="body" className="mt-3 text-gray-500">
            {item.description}
          </Text>

          <View className="mt-6 flex-row items-center justify-between">
            <Text variant="label" className="text-gray-700">
              {t('menu.quantity')}
            </Text>
            <Stepper quantity={quantity} onChange={setQuantity} name={item.name} />
          </View>

          <TextField
            label={t('menu.instructionLabel')}
            placeholder={t('menu.instructionPlaceholder')}
            value={instruction}
            onChangeText={setInstruction}
            maxLength={INSTRUCTION_MAX}
            multiline
            className="mt-6"
          />
        </View>
      </ScrollView>

      <View className="border-t border-gray-100 px-4 pb-5 pt-3">
        <Button onPress={handleAdd}>
          {t('menu.addWithTotal', {
            count: quantity,
            total: formatMoney(item.priceMinor * quantity, currency, i18n.language),
          })}
        </Button>
      </View>
    </Shell>
  );
}

type StepperProps = {
  quantity: number;
  onChange: (next: number) => void;
  name: string;
};

function Stepper({ quantity, onChange, name }: StepperProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center rounded-full bg-gray-100 px-1 py-1">
      <Pressable
        onPress={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity === 1}
        accessibilityRole="button"
        accessibilityLabel={t('cart.decrease', { name })}
        hitSlop={6}
        className="h-8 w-8 items-center justify-center rounded-full active:bg-gray-200"
      >
        <Ionicons
          name="remove"
          size={17}
          color={quantity === 1 ? colors.gray[300] : colors.gray[700]}
        />
      </Pressable>
      <Text variant="label" className="w-8 text-center text-gray-900">
        {quantity}
      </Text>
      <Pressable
        onPress={() => onChange(quantity + 1)}
        accessibilityRole="button"
        accessibilityLabel={t('cart.increase', { name })}
        hitSlop={6}
        className="h-8 w-8 items-center justify-center rounded-full active:bg-gray-200"
      >
        <Ionicons name="add" size={17} color={colors.gray[700]} />
      </Pressable>
    </View>
  );
}

function Shell({ title, children }: { title?: string; children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={title ?? t('menu.dish')} />
      {children}
    </View>
  );
}
