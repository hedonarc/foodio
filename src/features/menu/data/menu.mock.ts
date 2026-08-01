import type { RestaurantMenu } from '../types/menu.types';

const build = (
  restaurantId: string,
  categories: {
    id: string;
    name: string;
    items: Omit<import('../types/menu.types').MenuItem, 'restaurantId' | 'categoryId'>[];
  }[],
): RestaurantMenu => ({
  restaurantId,
  categories: categories.map((category) => ({
    id: `${restaurantId}-${category.id}`,
    restaurantId,
    name: category.name,
    items: category.items.map((item) => ({
      ...item,
      restaurantId,
      categoryId: `${restaurantId}-${category.id}`,
    })),
  })),
});

export const MOCK_MENUS: Record<string, RestaurantMenu> = {
  'rest-1': build('rest-1', [
    {
      id: 'popular',
      name: 'Popular',
      items: [
        {
          id: 'r1-pop-1',
          name: 'Birria Tacos',
          description:
            'Three slow-braised beef tacos with melted cheese, served with consomé for dipping.',
          price: 14.99,
          image:
            'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
          rating: 4.9,
          isPopular: true,
        },
        {
          id: 'r1-pop-2',
          name: 'Loaded Nachos',
          description:
            'House chips topped with queso, refried beans, jalapeños, pico de gallo, and crema.',
          price: 11.5,
          image:
            'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
          rating: 4.7,
          isPopular: true,
        },
        {
          id: 'r1-pop-3',
          name: 'Horchata',
          description: 'Sweet rice and cinnamon beverage, blended fresh throughout the day.',
          price: 4.25,
          image:
            'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
        },
      ],
    },
    {
      id: 'tacos',
      name: 'Tacos',
      items: [
        {
          id: 'r1-taco-1',
          name: 'Al Pastor Taco',
          description:
            'Marinated pork shoulder with pineapple, onion, and cilantro on a hand-pressed tortilla.',
          price: 4.5,
          image:
            'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
        },
        {
          id: 'r1-taco-2',
          name: 'Carne Asada Taco',
          description: 'Grilled steak with avocado salsa, lime, and a touch of cotija cheese.',
          price: 4.75,
          image:
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r1-taco-3',
          name: 'Fish Taco',
          description: 'Beer-battered cod with cabbage slaw and chipotle aioli.',
          price: 4.95,
          image:
            'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'burritos',
      name: 'Burritos',
      items: [
        {
          id: 'r1-bur-1',
          name: 'Carne Asada Burrito',
          description:
            'Grilled steak, rice, beans, cheese, and pico wrapped in a warm flour tortilla.',
          price: 13.5,
          image:
            'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r1-bur-2',
          name: 'Veggie Burrito',
          description: 'Roasted peppers, black beans, rice, guacamole, and salsa verde.',
          price: 11.95,
          image:
            'https://images.unsplash.com/photo-1604467715878-83e57e8bc129?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'drinks',
      name: 'Drinks',
      items: [
        {
          id: 'r1-drink-1',
          name: 'Mexican Cola',
          description: 'Glass-bottled cola made with cane sugar.',
          price: 3.5,
          image:
            'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r1-drink-2',
          name: 'Fresh Lime Agua Fresca',
          description: 'House-pressed lime with a hint of mint.',
          price: 4.0,
          image:
            'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
  ]),

  'rest-2': build('rest-2', [
    {
      id: 'popular',
      name: 'Popular',
      items: [
        {
          id: 'r2-pop-1',
          name: 'Truffle Tagliatelle',
          description: 'House-made tagliatelle in a creamy black truffle sauce with parmesan.',
          price: 24.0,
          image:
            'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80',
          rating: 4.9,
          isPopular: true,
        },
        {
          id: 'r2-pop-2',
          name: 'Margherita Pizza',
          description: 'San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil.',
          price: 18.5,
          image:
            'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
          isPopular: true,
        },
      ],
    },
    {
      id: 'pasta',
      name: 'Pasta',
      items: [
        {
          id: 'r2-pasta-1',
          name: 'Spaghetti Carbonara',
          description: 'Guanciale, egg yolk, pecorino romano, and cracked black pepper.',
          price: 21.0,
          image:
            'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
        },
        {
          id: 'r2-pasta-2',
          name: 'Penne Arrabbiata',
          description: 'Penne in a spicy tomato and garlic sauce with chili flakes.',
          price: 17.5,
          image:
            'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r2-pasta-3',
          name: 'Lasagna Bolognese',
          description: 'Slow-simmered ragù layered with fresh pasta sheets and béchamel.',
          price: 22.0,
          image:
            'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'pizza',
      name: 'Pizza',
      items: [
        {
          id: 'r2-pizza-1',
          name: 'Diavola Pizza',
          description: 'Spicy salami, mozzarella, tomato, and chili oil.',
          price: 19.5,
          image:
            'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r2-pizza-2',
          name: 'Quattro Formaggi',
          description: 'Mozzarella, gorgonzola, fontina, and parmesan on a white base.',
          price: 20.0,
          image:
            'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'desserts',
      name: 'Desserts',
      items: [
        {
          id: 'r2-des-1',
          name: 'Tiramisu',
          description: 'Layers of espresso-soaked ladyfingers and mascarpone cream.',
          price: 9.5,
          image:
            'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r2-des-2',
          name: 'Panna Cotta',
          description: 'Vanilla bean panna cotta with wild berry compote.',
          price: 8.0,
          image:
            'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
  ]),

  'rest-3': build('rest-3', [
    {
      id: 'popular',
      name: 'Popular',
      items: [
        {
          id: 'r3-pop-1',
          name: 'Dragon Roll',
          description: 'Eel and cucumber inside, topped with avocado, eel sauce, and sesame.',
          price: 18.0,
          image:
            'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80',
          rating: 4.9,
          isPopular: true,
        },
        {
          id: 'r3-pop-2',
          name: 'Tonkotsu Ramen',
          description: '18-hour pork bone broth, chashu, soft egg, scallions, and nori.',
          price: 16.5,
          image:
            'https://images.unsplash.com/photo-1623341214825-9f4f963727da?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
          isPopular: true,
        },
      ],
    },
    {
      id: 'sushi',
      name: 'Sushi',
      items: [
        {
          id: 'r3-sus-1',
          name: 'Salmon Nigiri',
          description: 'Two pieces of fresh salmon over seasoned sushi rice.',
          price: 7.0,
          image:
            'https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r3-sus-2',
          name: 'Spicy Tuna Roll',
          description: 'Tuna, sriracha aioli, cucumber, and scallions.',
          price: 12.0,
          image:
            'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'ramen',
      name: 'Ramen',
      items: [
        {
          id: 'r3-ram-1',
          name: 'Miso Ramen',
          description: 'Rich miso broth with corn, butter, chashu, and bean sprouts.',
          price: 15.0,
          image:
            'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r3-ram-2',
          name: 'Shoyu Ramen',
          description: 'Clear soy-based broth with chicken chashu and menma.',
          price: 14.5,
          image:
            'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
  ]),

  'rest-4': build('rest-4', [
    {
      id: 'popular',
      name: 'Popular',
      items: [
        {
          id: 'r4-pop-1',
          name: 'Double Smash Burger',
          description:
            'Two 4oz patties, American cheese, pickles, onions, and house sauce on a toasted brioche.',
          price: 13.5,
          image:
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          rating: 4.9,
          isPopular: true,
        },
        {
          id: 'r4-pop-2',
          name: 'Loaded Fries',
          description: 'Crispy fries with cheese sauce, bacon bits, scallions, and ranch drizzle.',
          price: 8.5,
          image:
            'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
          rating: 4.7,
          isPopular: true,
        },
      ],
    },
    {
      id: 'burgers',
      name: 'Burgers',
      items: [
        {
          id: 'r4-bur-1',
          name: 'Classic Cheeseburger',
          description: 'Single smash patty, cheddar, lettuce, tomato, onion, and house sauce.',
          price: 11.0,
          image:
            'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r4-bur-2',
          name: 'Bacon Blue Burger',
          description: 'Smashed patty, blue cheese, applewood bacon, and caramelized onion.',
          price: 14.5,
          image:
            'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
          rating: 4.6,
        },
        {
          id: 'r4-bur-3',
          name: 'Mushroom Swiss Burger',
          description: 'Sautéed cremini mushrooms, Swiss cheese, garlic aioli.',
          price: 13.0,
          image:
            'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'drinks',
      name: 'Drinks',
      items: [
        {
          id: 'r4-dr-1',
          name: 'Vanilla Milkshake',
          description: 'Hand-spun vanilla bean milkshake with whipped cream.',
          price: 6.0,
          image:
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r4-dr-2',
          name: 'Craft Cola',
          description: 'Small-batch cola with real cane sugar.',
          price: 4.0,
          image:
            'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
  ]),

  'rest-5': build('rest-5', [
    {
      id: 'popular',
      name: 'Popular',
      items: [
        {
          id: 'r5-pop-1',
          name: 'Açaí Power Bowl',
          description: 'Organic açaí blend topped with granola, banana, berries, and honey.',
          price: 12.5,
          image:
            'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80',
          rating: 4.9,
          isPopular: true,
        },
        {
          id: 'r5-pop-2',
          name: 'Green Goddess Bowl',
          description: 'Quinoa, kale, avocado, edamame, and lemon-tahini dressing.',
          price: 13.0,
          image:
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
          isPopular: true,
        },
      ],
    },
    {
      id: 'bowls',
      name: 'Bowls',
      items: [
        {
          id: 'r5-bow-1',
          name: 'Mediterranean Bowl',
          description: 'Falafel, hummus, cucumber, tomato, olives, and tzatziki over rice.',
          price: 13.5,
          image:
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r5-bow-2',
          name: 'Buddha Bowl',
          description: 'Brown rice, roasted sweet potato, chickpeas, kale, and tahini.',
          price: 12.0,
          image:
            'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'drinks',
      name: 'Drinks',
      items: [
        {
          id: 'r5-dr-1',
          name: 'Cold-Pressed Green Juice',
          description: 'Kale, apple, ginger, lemon, and celery.',
          price: 7.5,
          image:
            'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r5-dr-2',
          name: 'Mango Smoothie',
          description: 'Almond milk, frozen mango, banana, and a touch of turmeric.',
          price: 8.0,
          image:
            'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
  ]),

  'rest-6': build('rest-6', [
    {
      id: 'popular',
      name: 'Popular',
      items: [
        {
          id: 'r6-pop-1',
          name: 'Butter Chicken',
          description: 'Tandoori chicken in a creamy tomato sauce with warm spices.',
          price: 16.5,
          image:
            'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
          rating: 4.9,
          isPopular: true,
        },
        {
          id: 'r6-pop-2',
          name: 'Lamb Biryani',
          description: 'Slow-cooked lamb layered with basmati rice, saffron, and whole spices.',
          price: 18.0,
          image:
            'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
          isPopular: true,
        },
      ],
    },
    {
      id: 'curry',
      name: 'Curry',
      items: [
        {
          id: 'r6-cur-1',
          name: 'Chicken Tikka Masala',
          description: 'Charred chicken in a spiced tomato-cream sauce.',
          price: 16.0,
          image:
            'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r6-cur-2',
          name: 'Palak Paneer',
          description: 'Fresh spinach curry with cubes of house-made paneer.',
          price: 15.0,
          image:
            'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'biryani',
      name: 'Biryani',
      items: [
        {
          id: 'r6-bir-1',
          name: 'Chicken Biryani',
          description: 'Bone-in chicken layered with fragrant basmati and fried onions.',
          price: 16.5,
          image:
            'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r6-bir-2',
          name: 'Vegetable Biryani',
          description: 'Seasonal vegetables, paneer, and aromatic rice.',
          price: 14.0,
          image:
            'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
  ]),

  'rest-7': build('rest-7', [
    {
      id: 'popular',
      name: 'Popular',
      items: [
        {
          id: 'r7-pop-1',
          name: 'Har Gow',
          description: 'Four pieces of translucent shrimp dumpling steamed in bamboo.',
          price: 8.5,
          image:
            'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
          isPopular: true,
        },
        {
          id: 'r7-pop-2',
          name: 'Beef Chow Fun',
          description: 'Wide rice noodles wok-tossed with beef, scallions, and bean sprouts.',
          price: 14.0,
          image:
            'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
          rating: 4.6,
          isPopular: true,
        },
      ],
    },
    {
      id: 'dimsum',
      name: 'Dim Sum',
      items: [
        {
          id: 'r7-ds-1',
          name: 'Siu Mai',
          description: 'Four pieces of pork and shrimp dumpling.',
          price: 8.0,
          image:
            'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r7-ds-2',
          name: 'Char Siu Bao',
          description: 'Steamed bun filled with honey-glazed barbecue pork.',
          price: 7.5,
          image:
            'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'noodles',
      name: 'Noodles',
      items: [
        {
          id: 'r7-noo-1',
          name: 'Dan Dan Noodles',
          description: 'Hand-pulled noodles in a spicy sesame and chili oil sauce.',
          price: 13.0,
          image:
            'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r7-noo-2',
          name: 'Wonton Noodle Soup',
          description: 'Shrimp wontons, egg noodles, and bok choy in a clear broth.',
          price: 12.5,
          image:
            'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
  ]),

  'rest-8': build('rest-8', [
    {
      id: 'popular',
      name: 'Popular',
      items: [
        {
          id: 'r8-pop-1',
          name: 'Beef Pho',
          description: '18-hour beef broth with rice noodles, brisket, and fresh herbs.',
          price: 14.5,
          image:
            'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
          rating: 4.9,
          isPopular: true,
        },
        {
          id: 'r8-pop-2',
          name: 'Banh Mi',
          description:
            'Crispy baguette with pickled vegetables, cilantro, and your choice of protein.',
          price: 10.0,
          image:
            'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
          isPopular: true,
        },
      ],
    },
    {
      id: 'pho',
      name: 'Pho',
      items: [
        {
          id: 'r8-pho-1',
          name: 'Chicken Pho',
          description: 'Light chicken broth with shredded chicken and herbs.',
          price: 13.5,
          image:
            'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r8-pho-2',
          name: 'Vegetable Pho',
          description: 'Seasonal vegetables and tofu in a fragrant vegan broth.',
          price: 12.5,
          image:
            'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'banhmi',
      name: 'Banh Mi',
      items: [
        {
          id: 'r8-bm-1',
          name: 'Pork Belly Banh Mi',
          description: 'Slow-roasted pork belly with pickled daikon and sriracha mayo.',
          price: 11.0,
          image:
            'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r8-bm-2',
          name: 'Lemongrass Tofu Banh Mi',
          description: 'Grilled lemongrass tofu with cucumber and hoisin.',
          price: 10.0,
          image:
            'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
  ]),

  'rest-9': build('rest-9', [
    {
      id: 'popular',
      name: 'Popular',
      items: [
        {
          id: 'r9-pop-1',
          name: 'Almond Croissant',
          description: 'Flaky, twice-baked croissant filled with almond frangipane.',
          price: 5.5,
          image:
            'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
          rating: 4.9,
          isPopular: true,
        },
        {
          id: 'r9-pop-2',
          name: 'Strawberry Cake Slice',
          description: 'Vanilla sponge layered with fresh strawberries and mascarpone cream.',
          price: 7.5,
          image:
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
          isPopular: true,
        },
      ],
    },
    {
      id: 'cakes',
      name: 'Cakes',
      items: [
        {
          id: 'r9-cak-1',
          name: 'Chocolate Ganache Tart',
          description: 'Dark chocolate ganache in a buttery shortbread crust.',
          price: 6.5,
          image:
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r9-cak-2',
          name: 'Carrot Cake Slice',
          description: 'Spiced carrot cake with cream cheese frosting and walnuts.',
          price: 7.0,
          image:
            'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'coffee',
      name: 'Coffee',
      items: [
        {
          id: 'r9-cof-1',
          name: 'Flat White',
          description: 'Double ristretto with silky steamed milk.',
          price: 4.5,
          image:
            'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r9-cof-2',
          name: 'Iced Latte',
          description: 'Espresso over ice with cold milk and a hint of vanilla.',
          price: 5.0,
          image:
            'https://images.unsplash.com/photo-1494314671902-399b18174975?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
  ]),

  'rest-10': build('rest-10', [
    {
      id: 'popular',
      name: 'Popular',
      items: [
        {
          id: 'r10-pop-1',
          name: 'Pad Thai',
          description: 'Stir-fried rice noodles with shrimp, egg, peanuts, and tamarind.',
          price: 14.5,
          image:
            'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
          rating: 4.9,
          isPopular: true,
        },
        {
          id: 'r10-pop-2',
          name: 'Green Curry',
          description: 'Coconut green curry with chicken, eggplant, and Thai basil.',
          price: 15.0,
          image:
            'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
          isPopular: true,
        },
      ],
    },
    {
      id: 'curry',
      name: 'Curry',
      items: [
        {
          id: 'r10-cur-1',
          name: 'Massaman Beef',
          description: 'Slow-braised beef in a mild peanut and potato curry.',
          price: 16.0,
          image:
            'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r10-cur-2',
          name: 'Panang Curry',
          description: 'Rich coconut curry with chicken, lime leaves, and chili.',
          price: 15.5,
          image:
            'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      id: 'noodles',
      name: 'Noodles',
      items: [
        {
          id: 'r10-noo-1',
          name: 'Pad See Ew',
          description: 'Wide rice noodles with chicken, Chinese broccoli, and dark soy.',
          price: 13.5,
          image:
            'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
        },
        {
          id: 'r10-noo-2',
          name: 'Drunken Noodles',
          description: 'Spicy stir-fried wide noodles with basil and chili.',
          price: 14.0,
          image:
            'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
  ]),
};
