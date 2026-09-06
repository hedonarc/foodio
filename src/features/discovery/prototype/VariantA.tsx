// PROTOTYPE — not production. See HomePrototype.tsx.
import { useState } from 'react';
import { FlatList, Keyboard, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { IdentityChip } from '@/features/identity/components/IdentityChip';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { colors } from '@/theme';

import { RecentClips } from '../components/RecentClips';
import { RestaurantCarousel } from '../components/RestaurantCarousel';
import { RestaurantList } from '../components/RestaurantList';
import { RestaurantPreviewCard } from '../components/RestaurantPreviewCard';

import { Chip, HOME_KEYS, SearchField, SearchTrigger } from './bits';
import type { Category } from './categories';
import { EMPTY_FILTERS, TOGGLE_LABELS, toggleIn, TOGGLES } from './filters';
import type { SearchModel } from './useSearchModel';
import { useSearchModel } from './useSearchModel';

export const NAME_A = 'Rail + top sheet';

/**
 * A — a rail of round cuisine icons under the search bar, and a search sheet
 * that drops from the top over a blurred Home. Filters are a chip row inside
 * the sheet. Tapping the blur closes it.
 */
export function VariantA() {
  const model = useSearchModel();
  const [open, setOpen] = useState(false);
  const { refreshing, onRefresh } = usePullToRefresh(HOME_KEYS);

  const openWith = (cuisine?: string) => {
    model.setFilters({ ...EMPTY_FILTERS, cuisines: cuisine ? [cuisine] : [] });
    setOpen(true);
  };
  const close = () => {
    Keyboard.dismiss();
    setOpen(false);
    model.reset();
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-1 px-3">
        <RestaurantList
          refreshing={refreshing}
          onRefresh={onRefresh}
          header={
            <>
              <View className="flex-row items-center gap-2">
                <SearchTrigger onPress={() => openWith()} />
                <IdentityChip />
              </View>
              <CategoryRail categories={model.categories} onPick={openWith} />
              <RestaurantCarousel />
              <RecentClips />
            </>
          }
        />
      </View>

      {open ? <TopSheet model={model} onClose={close} /> : null}
    </SafeAreaView>
  );
}

function CategoryRail({
  categories,
  onPick,
}: {
  categories: Category[];
  onPick: (name: string) => void;
}) {
  if (categories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-5 flex-grow-0"
      contentContainerClassName="pr-3"
    >
      {categories.slice(0, 10).map((category) => (
        <Pressable
          key={category.name}
          onPress={() => onPick(category.name)}
          accessibilityRole="button"
          accessibilityLabel={category.name}
          className="mr-3 w-16 items-center active:opacity-70"
        >
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-50">
            <Text className="text-2xl">{category.emoji}</Text>
          </View>
          <Text variant="caption" numberOfLines={1} className="mt-1.5 text-gray-700">
            {category.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function TopSheet({ model, onClose }: { model: SearchModel; onClose: () => void }) {
  // Absolute children ignore the SafeAreaView's padding, so the sheet pads itself.
  const insets = useSafeAreaInsets();
  const browsing =
    !model.query && model.filters.cuisines.length === 0 && model.filters.toggles.length === 0;

  return (
    <View className="absolute inset-0">
      <BlurView
        intensity={45}
        tint="light"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close search"
        className="absolute inset-0 bg-black/10"
      />

      <View
        className="rounded-b-3xl bg-white px-3 pb-4"
        style={{ maxHeight: '80%', elevation: 12, paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center gap-3 py-1">
          <SearchField
            autoFocus
            value={model.text}
            onChange={model.setText}
            onClear={() => model.setText('')}
            onSubmit={() => model.remember(model.text)}
          />
          <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
            <Text variant="label" className="text-primary-600">
              Cancel
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          className="mt-3 flex-grow-0"
        >
          {model.filters.cuisines.map((cuisine) => (
            <Chip
              key={cuisine}
              label={cuisine}
              on
              trailingIcon="close"
              onPress={() =>
                model.setFilters({
                  ...model.filters,
                  cuisines: toggleIn(model.filters.cuisines, cuisine),
                })
              }
            />
          ))}
          {TOGGLES.map((toggle) => (
            <Chip
              key={toggle}
              label={TOGGLE_LABELS[toggle]}
              on={model.filters.toggles.includes(toggle)}
              onPress={() =>
                model.setFilters({
                  ...model.filters,
                  toggles: toggleIn(model.filters.toggles, toggle),
                })
              }
            />
          ))}
        </ScrollView>

        {browsing ? (
          <ScrollView keyboardShouldPersistTaps="handled" className="mt-4">
            <Text variant="label" className="mb-2 text-gray-500">
              Recent
            </Text>
            {model.recents.map((term) => (
              <Pressable
                key={term}
                onPress={() => model.setText(term)}
                accessibilityRole="button"
                className="flex-row items-center py-2.5"
              >
                <Ionicons name="time-outline" size={18} color={colors.gray[400]} />
                <Text className="ml-3 flex-1 text-gray-800">{term}</Text>
                <Ionicons name="arrow-up-outline" size={16} color={colors.gray[300]} />
              </Pressable>
            ))}

            <Text variant="label" className="mb-3 mt-4 text-gray-500">
              Browse by cuisine
            </Text>
            <View className="flex-row flex-wrap gap-y-2 pb-2">
              {model.categories.map((category) => (
                <Chip
                  key={category.name}
                  label={category.name}
                  leading={category.emoji}
                  onPress={() => model.setFilters({ ...model.filters, cuisines: [category.name] })}
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            data={model.results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            className="mt-3"
            ListHeaderComponent={
              <Text variant="caption" className="mb-2 text-gray-500">
                {model.results.length} places
              </Text>
            }
            ListEmptyComponent={
              <Text className="py-6 text-center text-gray-500">Nothing matched.</Text>
            }
            renderItem={({ item }) => <RestaurantPreviewCard restaurant={item} wide />}
          />
        )}
      </View>
    </View>
  );
}
