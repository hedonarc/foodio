import { Photo } from '@/components/ui';

type RestaurantHeroProps = {
  image: string;
  name: string;
};

/** Renders nothing when the restaurant has no photograph, so the page starts at its name. */
export function RestaurantHero({ image, name }: RestaurantHeroProps) {
  return <Photo uri={image} className="h-56 w-full" accessibilityLabel={name} />;
}
