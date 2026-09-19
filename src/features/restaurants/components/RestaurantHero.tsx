import { View } from 'react-native';

import { Photo } from '@/components/ui';

type RestaurantHeroProps = {
  image: string;
  name: string;
};

/**
 * The photograph, or the room the floating back button needs.
 *
 * With no photograph the page used to start at the name, and the back button
 * floated straight over it — "Push Test Grill" read "…sh Test Grill". The
 * spacer is the button's zone, so a page without a picture starts under it.
 */
export function RestaurantHero({ image, name }: RestaurantHeroProps) {
  if (!image) return <View className="h-16" />;

  return <Photo uri={image} className="h-56 w-full" accessibilityLabel={name} />;
}
