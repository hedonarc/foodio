import { useCallback } from 'react';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { useOnboardingStore } from '@/stores/onboarding.store';

import locationPermission from '@assets/images/location_permission.svg';

import { PermissionScreen } from '../components/PermissionScreen';
import { useLocationPermission } from '../hooks/useLocationPermission';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { requestPermission } = useLocationPermission();
  const completeLocationStep = useOnboardingStore((state) => state.completeLocationStep);

  const handleAllow = useCallback(async () => {
    await requestPermission();
    completeLocationStep();
    router.push('/(onboarding)/notifications');
  }, [requestPermission, completeLocationStep, router]);

  const handleSkip = useCallback(() => {
    completeLocationStep();
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
      title="Enable Location"
      description="Find restaurants and deals near you"
      onAllow={handleAllow}
      onSkip={handleSkip}
    />
  );
}
