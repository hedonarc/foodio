import { useCallback } from 'react';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { usePermissionRequest } from '@/hooks/usePermissionRequest';
import { PermissionType } from '@/services/permissions';
import { useOnboardingStore } from '@/stores/onboarding.store';

import locationPermission from '@assets/images/location_permission.svg';

import { PermissionScreen } from '../components/PermissionScreen';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { request } = usePermissionRequest();
  const completeLocationStep = useOnboardingStore((state) => state.completeLocationStep);

  const handleAllow = useCallback(async () => {
    await request(PermissionType.Location);
    await completeLocationStep();
    router.push('/(onboarding)/notifications');
  }, [request, completeLocationStep, router]);

  const handleSkip = useCallback(async () => {
    await completeLocationStep();
    router.push('/(onboarding)/notifications');
  }, [completeLocationStep, router]);

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
      onAllow={handleAllow}
      onSkip={handleSkip}
    />
  );
}
