import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useOnboardingStore } from '@/stores/onboarding.store';

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
      illustration={<Ionicons name="location-outline" size={120} color="#4CAF50" />}
      title="Enable Location"
      description="Find restaurants and deals near you"
      onAllow={handleAllow}
      onSkip={handleSkip}
    />
  );
}
