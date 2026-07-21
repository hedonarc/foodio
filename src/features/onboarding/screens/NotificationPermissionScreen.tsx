import { useCallback } from 'react';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { useOnboardingStore } from '@/stores/onboarding.store';

import notificationPermission from '@assets/images/notification_permission.svg';

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
      illustration={
        <Image
          source={notificationPermission}
          style={{ width: 250, height: 250 }}
          contentFit="contain"
        />
      }
      title="Stay Updated"
      description="Get notified about orders and deals"
      onAllow={handleAllow}
      onSkip={handleSkip}
    />
  );
}
