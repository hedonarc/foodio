import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useOnboardingStore } from '@/stores/onboarding.store';

import { PermissionScreen } from '../components/PermissionScreen';
import { useNotificationPermission } from '../hooks/useNotificationPermission';

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const { requestPermission } = useNotificationPermission();
  const completeNotificationStep = useOnboardingStore((state) => state.completeNotificationStep);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);

  const handleAllow = useCallback(async () => {
    await requestPermission();
    completeNotificationStep();
    completeOnboarding();
    router.replace('/(tabs)');
  }, [requestPermission, completeNotificationStep, completeOnboarding, router]);

  const handleSkip = useCallback(() => {
    completeNotificationStep();
    completeOnboarding();
    router.replace('/(tabs)');
  }, [completeNotificationStep, completeOnboarding, router]);

  return (
    <PermissionScreen
      illustration={<Ionicons name="notifications-outline" size={120} color="#FF9800" />}
      title="Stay Updated"
      description="Get notified about orders and deals"
      onAllow={handleAllow}
      onSkip={handleSkip}
    />
  );
}
