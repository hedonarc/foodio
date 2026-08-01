import { useCallback } from 'react';

import { Image } from 'expo-image';

import { usePermissionRequest } from '@/hooks/usePermissionRequest';
import { logError } from '@/lib/logger';
import { PermissionType } from '@/services/permissions';
import { useOnboardingStore } from '@/stores/onboarding.store';

import locationPermission from '@assets/images/location_permission.svg';

import { PermissionScreen } from '../components/PermissionScreen';

export default function LocationPermissionScreen() {
  const { request } = usePermissionRequest();
  const completeLocationStep = useOnboardingStore((state) => state.completeLocationStep);

  /**
   * No navigation here on purpose — the onboarding layout decides which screen
   * exists for the current step, so completing the step is what moves the user
   * on. Failures are logged rather than thrown, because being unable to record
   * the step must not strand anyone on this screen.
   */
  const advance = useCallback(async () => {
    try {
      await completeLocationStep();
    } catch (error) {
      logError('onboarding.location.complete', error);
    }
  }, [completeLocationStep]);

  const handleAllow = useCallback(async () => {
    try {
      await request(PermissionType.Location);
    } catch (error) {
      // Denying, or the permission being unavailable, must not block onboarding.
      logError('onboarding.location.request', error);
    }
    await advance();
  }, [request, advance]);

  return (
    <PermissionScreen
      illustration={
        <Image
          source={locationPermission}
          style={{ width: 250, height: 250 }}
          contentFit="contain"
        />
      }
      titleKey="onboarding.location.title"
      descriptionKey="onboarding.location.description"
      onAllow={() => void handleAllow()}
      onSkip={() => void advance()}
    />
  );
}
