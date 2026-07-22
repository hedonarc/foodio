export type RestaurantHour = {
  day: string;
  hours: string;
};

export type RestaurantReview = {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: string;
  distance: string;
  image: string;
  description: string;
  address: string;
  gallery: string[];
  hours: RestaurantHour[];
  reviews: RestaurantReview[];
};
