import { type TextStyle } from 'react-native';

export const typography = {
  heading: {
    size: 30,
    weight: '700' as TextStyle['fontWeight'],
    lineHeight: 36,
  },
  subheading: {
    size: 20,
    weight: '700' as TextStyle['fontWeight'],
    lineHeight: 28,
  },
  body: {
    size: 16,
    weight: '400' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  bodyMedium: {
    size: 16,
    weight: '600' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  label: {
    size: 14,
    weight: '600' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  caption: {
    size: 12,
    weight: '400' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
} as const;
