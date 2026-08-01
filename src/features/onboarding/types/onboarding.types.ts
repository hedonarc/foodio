import type { ImageSourcePropType } from 'react-native';

export enum OnboardingStep {
  Location = 'location',
  Notifications = 'notifications',
  Complete = 'complete',
}

export type PermissionScreenProps = {
  illustration: ImageSourcePropType;
  title: string;
  description: string;
  onAllow: () => void;
  onSkip: () => void;
};
