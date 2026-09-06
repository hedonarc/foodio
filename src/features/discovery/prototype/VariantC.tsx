// PROTOTYPE — not production. See HomePrototype.tsx.
import { useState } from 'react';
import { FlatList, Keyboard, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { IdentityChip } from '@/features/identity/components/IdentityChip';
import { cn } from '@/lib/cn';
import { colors } from '@/theme';

import { RecentClips } from '../components/RecentClips';
import { RestaurantCarousel } from '../components/RestaurantCarousel';
import { RestaurantPreviewCard } from '../components/RestaurantPreviewCard';
import { SectionHeader } from '../components/SectionHeader';

import { Chip, SearchField } from './bits';
import type { SortKey } from './filters';
import { SORT_LABELS, toggleIn } from './filters';
import type { SearchModel } from './useSearchModel';
import { useSearchModel } from './useSearchModel';

export const NAME_C = 'Pills + in place';

const QUICK_SORTS: readonly SortKey[] = ['nearest', 'rating', 'fastest'];

/**
 * C — categories are pills that filter Home itself, live and multi-select.
 * Search happens in place: the field stays put, the Home body below the pills
 * blurs, and results with a sort control render over it. Nothing opens.
 */
export function VariantC() {
  const model = useSearchModel();
  const [focused, setFocused] = useState(false);
  const searching = focused || model.text.length > 0;

  const done = () => {
    Keyboard.dismiss();
    setFocused(false);
    model.setText('');
  };

  const { cuisines } = model.filters;
  const pickCuisine = (name: string) =>
    model.setFilters({ ...model.filters, cuisines: toggleIn(cuisines, name) });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="px-3">
        <View className="flex-row items-center gap-2 py-3">
          <SearchField
            value={model.text}
            onChange={model.setText}
            onClear={() => model.setText('')}
            onFocus={() => setFocused(true)}
            onSubmit={() => model.remember(model.text)}
          />
          {searching ? (
            <Pressable onPress={done} hitSlop={8} accessibilityRole="button" className="px-1">
              <Text variant="label" className="text-primary-600">
                Done
              </Text>
            </Pressable>
          ) : (
            <IdentityChip />
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          className="flex-grow-0 pb-3"
        >
          <Chip
            label="All"
            on={cuisines.length === 0}
            onPress={() => model.setFilters({ ...model.filters, cuisines: [] })}
          />
          {model.categories.map((category) => (
            <Chip
              key={category.name}
              label={category.name}
              leading={category.emoji}
              on={cuisines.includes(category.name)}
              onPress={() => pickCuisine(category.name)}
            />
          ))}
        </ScrollView>
      </View>

      <View className="flex-1">
        <HomeBody model={model} />
        {searching ? <InPlaceResults model={model} /> : null}
      </View>
    </SafeAreaView>
  );
}

/** The Home list, narrowed by whichever pills are on. */
function HomeBody({ model }: { model: SearchModel }) {
  const { cuisines } = model.filters;
  const title =
    cuisines.length === 0
      ? `All restaurants · ${model.results.length}`
      : `${model.results.length} places · ${cuisines.join(', ')}`;

  return (
    <FlatList
      data={model.results}
      keyExtractor={(item) => item.id}
      className="px-3"
      contentContainerClassName="pb-6"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {cuisines.length === 0 ? (
            <>
              <RestaurantCarousel />
              <RecentClips />
            </>
          ) : null}
          <SectionHeader title={title} />
        </>
      }
      ListEmptyComponent={
        <Text className="py-6 text-center text-gray-500">Nobody serves that yet.</Text>
      }
      renderItem={({ item }) => <RestaurantPreviewCard restaurant={item} wide />}
    />
  );
}

function InPlaceResults({ model }: { model: SearchModel }) {
  const idle = !model.query && model.filters.cuisines.length === 0;

  return (
    <View className="absolute inset-0">
      <BlurView
        intensity={100}
        tint="light"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />
      {/* The blur alone leaves Home legible underneath; the wash makes this a layer. */}
      <View className="flex-1 bg-white/70 px-3 pt-2">
        <View
          className="mb-3 flex-row rounded-2xl border border-gray-200 bg-white p-1"
          style={{ elevation: 2 }}
        >
          {QUICK_SORTS.map((sort) => {
            const on = model.filters.sort === sort;
            return (
              <Pressable
                key={sort}
                onPress={() => model.setFilters({ ...model.filters, sort })}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                className={cn(
                  'flex-1 items-center rounded-xl py-2',
                  on ? 'bg-white' : 'bg-transparent',
                )}
                style={on ? { elevation: 2 } : undefined}
              >
                <Text variant="label" className={on ? 'text-gray-900' : 'text-gray-500'}>
                  {SORT_LABELS[sort]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {idle ? (
          <View
            className="rounded-2xl border border-gray-100 bg-white p-4"
            style={{ elevation: 2 }}
          >
            <Text variant="label" className="mb-1 text-gray-500">
              Recent
            </Text>
            {model.recents.map((term) => (
              <Pressable
                key={term}
                onPress={() => model.setText(term)}
                accessibilityRole="button"
                className="flex-row items-center py-3"
              >
                <Ionicons name="time-outline" size={18} color={colors.gray[400]} />
                <Text className="ml-3 flex-1 text-gray-800">{term}</Text>
              </Pressable>
            ))}
            <Text variant="caption" className="mt-3 text-gray-400">
              Or pick a cuisine above — results land here as you type.
            </Text>
          </View>
        ) : (
          <FlatList
            data={model.results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="pb-6"
            ListHeaderComponent={
              <Text
                variant="caption"
                className="mb-2 self-start rounded-full bg-white px-2.5 py-1 text-gray-600"
              >
                {model.results.length} places{model.query ? ` for “${model.query}”` : ''}
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
