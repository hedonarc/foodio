import { useCallback } from 'react';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { usePermissionRequest } from '@/hooks/usePermissionRequest';
import { useOnboardingStore } from '@/stores/onboarding.store';

import notificationPermission from '@assets/images/notification_permission.svg';

import { PermissionScreen } from '../components/PermissionScreen';

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const { request } = usePermissionRequest();
  const completeNotificationStep = useOnboardingStore((state) => state.completeNotificationStep);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);

  const handleAllow = useCallback(async () => {
    await request('notification');
    completeNotificationStep();
    completeOnboarding();
    router.replace('/(tabs)');
  }, [request, completeNotificationStep, completeOnboarding, router]);

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
      titleKey="onboarding.notifications.title"
      descriptionKey="onboarding.notifications.description"
      onAllow={handleAllow}
      onSkip={handleSkip}
    />
  );
}
