import type { ImageSourcePropType } from 'react-native';

export type PermissionScreenProps = {
  illustration: ImageSourcePropType;
  title: string;
  description: string;
  onAllow: () => void;
  onSkip: () => void;
};
