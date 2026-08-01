import { useCallback } from 'react';

import { Image } from 'expo-image';

import { usePermissionRequest } from '@/hooks/usePermissionRequest';
import { logError } from '@/lib/logger';
import { PermissionType } from '@/services/permissions';
import { useOnboardingStore } from '@/stores/onboarding.store';

import notificationPermission from '@assets/images/notification_permission.svg';

import { PermissionScreen } from '../components/PermissionScreen';

export default function NotificationPermissionScreen() {
  const { request } = usePermissionRequest();
  const completeNotificationStep = useOnboardingStore((state) => state.completeNotificationStep);

  /**
   * No navigation here on purpose — see LocationPermissionScreen. Completing
   * the final step removes the whole onboarding group from the navigator, and
   * the router falls back to the app.
   */
  const finish = useCallback(async () => {
    try {
      await completeNotificationStep();
    } catch (error) {
      logError('onboarding.notifications.complete', error);
    }
  }, [completeNotificationStep]);

  const handleAllow = useCallback(async () => {
    try {
      await request(PermissionType.Notification);
    } catch (error) {
      logError('onboarding.notifications.request', error);
    }
    await finish();
  }, [request, finish]);

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
      onAllow={() => void handleAllow()}
      onSkip={() => void finish()}
    />
  );
}
