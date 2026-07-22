export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  distance: string;
  image: string;
};

export type FeaturedVideo = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  title: string;
  thumbnail: string;
};
