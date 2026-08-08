import { Pressable } from 'react-native';

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { colors } from '@/theme';

export default function KitchenLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.gray[400],
        // The library leaves the Android ripple borderless with no radius, so
        // it's sized from the tab's full width — much wider than the bar is
        // tall — and bleeds past the top and bottom edges instead of landing
        // as a full circle.
        tabBarButton: ({ ref: _ref, ...props }) => (
          <Pressable
            {...props}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.32)', borderless: true, radius: 28 }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('work.tabs.orders'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: t('work.tabs.menu'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
