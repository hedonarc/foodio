// PROTOTYPE — not production. See HomePrototype.tsx.
import { useState } from 'react';
import { FlatList, Keyboard, Modal, Pressable, ScrollView, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button, Photo, SheetContainer, Text } from '@/components/ui';
import { IdentityChip } from '@/features/identity/components/IdentityChip';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/lib/cn';
import { colors } from '@/theme';

import { RecentClips } from '../components/RecentClips';
import { RestaurantCarousel } from '../components/RestaurantCarousel';
import { RestaurantList } from '../components/RestaurantList';

import { Chip, HOME_KEYS, ResultRow, SearchField, SearchTrigger } from './bits';
import type { Category } from './categories';
import type { SearchFilters } from './filters';
import {
  activeFilterCount,
  EMPTY_FILTERS,
  SORT_LABELS,
  SORTS,
  TOGGLE_LABELS,
  toggleIn,
  TOGGLES,
} from './filters';
import type { SearchModel } from './useSearchModel';
import { useSearchModel } from './useSearchModel';

export const NAME_B = 'Tiles + filter sheet';

/**
 * B — categories as a two-row grid of photographed tiles; search as a
 * full-screen takeover with compact result rows, and every filter behind one
 * "Filters" button that opens a bottom sheet.
 */
export function VariantB() {
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
              <CategoryTiles categories={model.categories} onPick={openWith} />
              <RestaurantCarousel />
              <RecentClips />
            </>
          }
        />
      </View>

      <Takeover visible={open} model={model} onClose={close} />
    </SafeAreaView>
  );
}

function CategoryTiles({
  categories,
  onPick,
}: {
  categories: Category[];
  onPick: (name: string) => void;
}) {
  if (categories.length === 0) return null;

  // Two rows: the grid scrolls sideways as columns of two.
  const columns: Category[][] = [];
  for (let i = 0; i < Math.min(categories.length, 12); i += 2) {
    columns.push(categories.slice(i, i + 2));
  }

  return (
    <View className="mb-5">
      <Text variant="subheading" className="mb-3 text-gray-900">
        Browse
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="pr-3"
      >
        {columns.map((column, index) => (
          <View key={index} className="mr-2.5">
            {column.map((category) => (
              <Pressable
                key={category.name}
                onPress={() => onPick(category.name)}
                accessibilityRole="button"
                accessibilityLabel={category.name}
                className="mb-2.5 h-24 w-32 overflow-hidden rounded-2xl bg-gray-200 active:opacity-80"
              >
                {category.image ? <Photo uri={category.image} className="h-full w-full" /> : null}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.65)']}
                  style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 56 }}
                />
                <View className="absolute bottom-2 left-2.5 flex-row items-center">
                  <Text className="mr-1.5 text-base">{category.emoji}</Text>
                  <Text variant="label" className="text-white">
                    {category.name}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Takeover({
  visible,
  model,
  onClose,
}: {
  visible: boolean;
  model: SearchModel;
  onClose: () => void;
}) {
  const [sheet, setSheet] = useState(false);
  const active = activeFilterCount(model.filters);
  const browsing = !model.query && active === 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} className="flex-1 bg-white px-3">
          <View className="flex-row items-center gap-2 py-2">
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Back"
              className="h-11 w-11 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="chevron-back" size={22} color={colors.gray[900]} />
            </Pressable>
            <SearchField
              autoFocus
              value={model.text}
              onChange={model.setText}
              onClear={() => model.setText('')}
              onSubmit={() => model.remember(model.text)}
            />
            <Pressable
              onPress={() => setSheet(true)}
              accessibilityRole="button"
              accessibilityLabel="Filters"
              className={cn(
                'h-11 flex-row items-center rounded-2xl px-3',
                active > 0 ? 'bg-primary-500' : 'bg-gray-100',
              )}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={active > 0 ? colors.white : colors.gray[900]}
              />
              {active > 0 ? (
                <Text variant="label" className="ml-1.5 text-white">
                  {active}
                </Text>
              ) : null}
            </Pressable>
          </View>

          {active > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              className="mt-1 flex-grow-0"
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
              {model.filters.toggles.map((toggle) => (
                <Chip
                  key={toggle}
                  label={TOGGLE_LABELS[toggle]}
                  on
                  trailingIcon="close"
                  onPress={() =>
                    model.setFilters({
                      ...model.filters,
                      toggles: toggleIn(model.filters.toggles, toggle),
                    })
                  }
                />
              ))}
              {model.filters.sort !== 'nearest' ? (
                <Chip
                  label={`Sort: ${SORT_LABELS[model.filters.sort]}`}
                  on
                  trailingIcon="close"
                  onPress={() => model.setFilters({ ...model.filters, sort: 'nearest' })}
                />
              ) : null}
            </ScrollView>
          ) : null}

          {browsing ? (
            <ScrollView keyboardShouldPersistTaps="handled" className="mt-3">
              <Text variant="label" className="mb-1 text-gray-500">
                Recent
              </Text>
              {model.recents.map((term) => (
                <Pressable
                  key={term}
                  onPress={() => model.setText(term)}
                  accessibilityRole="button"
                  className="flex-row items-center border-b border-gray-100 py-3"
                >
                  <Ionicons name="time-outline" size={18} color={colors.gray[400]} />
                  <Text className="ml-3 flex-1 text-gray-800">{term}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.gray[300]} />
                </Pressable>
              ))}
              <Text variant="label" className="mb-3 mt-5 text-gray-500">
                Cuisines
              </Text>
              <View className="flex-row flex-wrap gap-y-2">
                {model.categories.map((category) => (
                  <Chip
                    key={category.name}
                    label={category.name}
                    leading={category.emoji}
                    onPress={() =>
                      model.setFilters({ ...model.filters, cuisines: [category.name] })
                    }
                  />
                ))}
              </View>
            </ScrollView>
          ) : (
            <FlatList
              data={model.results}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              className="mt-2"
              ListHeaderComponent={
                <Text variant="caption" className="mb-1 text-gray-500">
                  {model.results.length} places · sorted by {SORT_LABELS[model.filters.sort]}
                </Text>
              }
              ListEmptyComponent={
                <Text className="py-6 text-center text-gray-500">Nothing matched.</Text>
              }
              renderItem={({ item }) => <ResultRow restaurant={item} />}
            />
          )}

          <FilterSheet
            visible={sheet}
            filters={model.filters}
            count={model.results.length}
            onChange={model.setFilters}
            onClose={() => setSheet(false)}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function FilterSheet({
  visible,
  filters,
  count,
  onChange,
  onClose,
}: {
  visible: boolean;
  filters: SearchFilters;
  count: number;
  onChange: (next: SearchFilters) => void;
  onClose: () => void;
}) {
  return (
    <SheetContainer visible={visible} onClose={onClose}>
      <View className="mb-4 flex-row items-center justify-between">
        <Text variant="subheading" className="text-gray-900">
          Filters
        </Text>
        <Pressable onPress={() => onChange(EMPTY_FILTERS)} hitSlop={8} accessibilityRole="button">
          <Text variant="label" className="text-primary-600">
            Reset
          </Text>
        </Pressable>
      </View>

      <Text variant="label" className="mb-1 text-gray-500">
        Sort by
      </Text>
      {SORTS.map((sort) => (
        <Pressable
          key={sort}
          onPress={() => onChange({ ...filters, sort })}
          accessibilityRole="radio"
          accessibilityState={{ checked: filters.sort === sort }}
          className="flex-row items-center py-3"
        >
          <Ionicons
            name={filters.sort === sort ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={filters.sort === sort ? colors.primary[500] : colors.gray[300]}
          />
          <Text className="ml-3 text-gray-900">{SORT_LABELS[sort]}</Text>
        </Pressable>
      ))}

      <Text variant="label" className="mb-1 mt-4 text-gray-500">
        Only show
      </Text>
      {TOGGLES.map((toggle) => {
        const on = filters.toggles.includes(toggle);
        return (
          <Pressable
            key={toggle}
            onPress={() => onChange({ ...filters, toggles: toggleIn(filters.toggles, toggle) })}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            className="flex-row items-center py-3"
          >
            <Ionicons
              name={on ? 'checkbox' : 'square-outline'}
              size={22}
              color={on ? colors.primary[500] : colors.gray[300]}
            />
            <Text className="ml-3 text-gray-900">{TOGGLE_LABELS[toggle]}</Text>
          </Pressable>
        );
      })}

      <Button onPress={onClose} className="mt-5">
        {`Show ${count} places`}
      </Button>
    </SheetContainer>
  );
}
