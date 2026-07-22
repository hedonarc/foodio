import { useCallback } from 'react';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { usePermissionRequest } from '@/hooks/usePermissionRequest';
import { PermissionType } from '@/services/permissions';
import { useOnboardingStore } from '@/stores/onboarding.store';

import notificationPermission from '@assets/images/notification_permission.svg';

import { PermissionScreen } from '../components/PermissionScreen';

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const { request } = usePermissionRequest();
  const completeNotificationStep = useOnboardingStore((state) => state.completeNotificationStep);

  const handleAllow = useCallback(async () => {
    await request(PermissionType.Notification);
    completeNotificationStep();
    router.replace('/(tabs)');
  }, [request, completeNotificationStep, router]);

  const handleSkip = useCallback(() => {
    completeNotificationStep();
    router.replace('/(tabs)');
  }, [completeNotificationStep, router]);

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
