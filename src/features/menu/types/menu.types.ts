export type MenuItem = {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating?: number;
  isPopular?: boolean;
};

export type MenuCategory = {
  id: string;
  restaurantId: string;
  name: string;
  items: MenuItem[];
};

export type RestaurantMenu = {
  restaurantId: string;
  categories: MenuCategory[];
};
