import type { Restaurant } from '../types/restaurant.types';

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Taco Fiesta',
    cuisine: 'Mexican • Tacos • Burritos',
    rating: 4.8,
    reviewCount: 342,
    deliveryTime: '20-30 min',
    deliveryFee: '$1.99',
    distance: '1.2 mi',
    image:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    description:
      'Authentic Mexican street food made fresh daily. Our birria tacos and hand-pressed tortillas bring the flavors of Jalisco to your doorstep.',
    address: '124 Taco Lane, Mission District, San Francisco, CA 94110',
    gallery: [
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1604467715878-83e57e8bc129?auto=format&fit=crop&w=600&q=80',
    ],
    hours: [
      { day: 'Mon – Thu', hours: '11:00 AM – 10:00 PM' },
      { day: 'Fri – Sat', hours: '11:00 AM – 11:30 PM' },
      { day: 'Sunday', hours: '12:00 PM – 9:00 PM' },
    ],
    reviews: [
      {
        id: 'rev-1',
        author: 'Maria G.',
        avatar: 'https://i.pravatar.cc/150?img=47',
        rating: 5,
        comment: 'Best birria tacos I have had outside Mexico! The consomé is absolutely divine.',
        date: 'Jul 18, 2026',
      },
      {
        id: 'rev-2',
        author: 'James T.',
        avatar: 'https://i.pravatar.cc/150?img=12',
        rating: 4,
        comment: 'Really good food, quick delivery. Will definitely order again.',
        date: 'Jul 10, 2026',
      },
    ],
  },
  {
    id: 'rest-2',
    name: 'Bella Italia Ristorante',
    cuisine: 'Italian • Pasta • Pizza',
    rating: 4.9,
    reviewCount: 521,
    deliveryTime: '25-35 min',
    deliveryFee: 'Free',
    distance: '2.4 mi',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    description:
      'Family-owned Italian trattoria serving handmade pasta and Neapolitan pizzas since 1992. Every dish is crafted with imported Italian ingredients.',
    address: '55 Via Roma, North Beach, San Francisco, CA 94133',
    gallery: [
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281318?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80',
    ],
    hours: [
      { day: 'Tue – Thu', hours: '12:00 PM – 10:00 PM' },
      { day: 'Fri – Sat', hours: '12:00 PM – 11:00 PM' },
      { day: 'Sun – Mon', hours: 'Closed' },
    ],
    reviews: [
      {
        id: 'rev-3',
        author: 'Sophie R.',
        avatar: 'https://i.pravatar.cc/150?img=5',
        rating: 5,
        comment: 'Incredible fresh pasta! The truffle tagliatelle is a must-try.',
        date: 'Jul 20, 2026',
      },
      {
        id: 'rev-4',
        author: 'Luca M.',
        avatar: 'https://i.pravatar.cc/150?img=33',
        rating: 5,
        comment: 'Reminds me of home in Naples. Perfection every time.',
        date: 'Jul 15, 2026',
      },
    ],
  },
  {
    id: 'rest-3',
    name: 'Sakura Sushi Bar',
    cuisine: 'Japanese • Sushi • Ramen',
    rating: 4.7,
    reviewCount: 289,
    deliveryTime: '15-25 min',
    deliveryFee: '$2.49',
    distance: '0.8 mi',
    image:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    description:
      'Premium sushi and authentic Japanese ramen. Fish flown in fresh twice weekly, rice seasoned to traditional Edomae perfection.',
    address: '8 Sakura Street, Japantown, San Francisco, CA 94115',
    gallery: [
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=600&q=80',
    ],
    hours: [
      { day: 'Mon – Fri', hours: '11:30 AM – 9:30 PM' },
      { day: 'Sat – Sun', hours: '12:00 PM – 10:00 PM' },
    ],
    reviews: [
      {
        id: 'rev-5',
        author: 'Aiko N.',
        avatar: 'https://i.pravatar.cc/150?img=9',
        rating: 5,
        comment: 'The freshest sushi in the city. Dragon rolls are spectacular.',
        date: 'Jul 19, 2026',
      },
    ],
  },
  {
    id: 'rest-4',
    name: 'Burger & Craft Grill',
    cuisine: 'American • Burgers • Fries',
    rating: 4.6,
    reviewCount: 198,
    deliveryTime: '20-30 min',
    deliveryFee: '$0.99',
    distance: '1.5 mi',
    image:
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    description:
      'Craft smash burgers using locally sourced beef and house-made sauces. Our thin crispy double smash is what dreams are made of.',
    address: '309 Grill Avenue, SoMa, San Francisco, CA 94107',
    gallery: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
    ],
    hours: [{ day: 'Mon – Sun', hours: '11:00 AM – 11:00 PM' }],
    reviews: [
      {
        id: 'rev-6',
        author: 'Derek P.',
        avatar: 'https://i.pravatar.cc/150?img=17',
        rating: 5,
        comment: 'This is the best smash burger I have ever tasted. The sauce is elite.',
        date: 'Jul 21, 2026',
      },
    ],
  },
  {
    id: 'rest-5',
    name: 'Green Leaf Bowls',
    cuisine: 'Healthy • Salads • Smoothies',
    rating: 4.9,
    reviewCount: 411,
    deliveryTime: '15-20 min',
    deliveryFee: 'Free',
    distance: '0.5 mi',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    description:
      'Nourish your body with cold-pressed smoothies, build-your-own power bowls, and seasonal salads. 100% organic and locally sourced.',
    address: '77 Wellness Blvd, Pacific Heights, San Francisco, CA 94115',
    gallery: [
      'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    ],
    hours: [
      { day: 'Mon – Fri', hours: '7:00 AM – 8:00 PM' },
      { day: 'Sat – Sun', hours: '8:00 AM – 6:00 PM' },
    ],
    reviews: [
      {
        id: 'rev-7',
        author: 'Priya K.',
        avatar: 'https://i.pravatar.cc/150?img=29',
        rating: 5,
        comment: 'My go-to healthy spot. The acai bowl is incredible and delivery is always fast.',
        date: 'Jul 22, 2026',
      },
    ],
  },
  {
    id: 'rest-6',
    name: 'Spice Route Curry House',
    cuisine: 'Indian • Curry • Biryani',
    rating: 4.8,
    reviewCount: 267,
    deliveryTime: '30-40 min',
    deliveryFee: '$2.99',
    distance: '3.1 mi',
    image:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    description:
      'Aromatic North and South Indian cuisine. Our biryani is slow-cooked for 6 hours with whole spices and saffron. Worth the wait.',
    address: '412 Curry Lane, Tenderloin, San Francisco, CA 94102',
    gallery: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=600&q=80',
    ],
    hours: [{ day: 'Mon – Sun', hours: '12:00 PM – 10:30 PM' }],
    reviews: [
      {
        id: 'rev-8',
        author: 'Arjun S.',
        avatar: 'https://i.pravatar.cc/150?img=53',
        rating: 5,
        comment: 'The butter chicken is as good as my mum makes it. High praise indeed.',
        date: 'Jul 17, 2026',
      },
    ],
  },
  {
    id: 'rest-7',
    name: 'Golden Dragon Express',
    cuisine: 'Chinese • Dim Sum • Noodles',
    rating: 4.5,
    reviewCount: 153,
    deliveryTime: '25-35 min',
    deliveryFee: '$1.49',
    distance: '2.0 mi',
    image:
      'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
    description:
      'Traditional Cantonese dim sum and hand-pulled noodles. Our chefs have been perfecting these recipes for over three generations.',
    address: '28 Dragon Court, Chinatown, San Francisco, CA 94108',
    gallery: [
      'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    ],
    hours: [{ day: 'Mon – Sun', hours: '10:00 AM – 10:00 PM' }],
    reviews: [
      {
        id: 'rev-9',
        author: 'Wei L.',
        avatar: 'https://i.pravatar.cc/150?img=60',
        rating: 4,
        comment: 'Solid dim sum. The har gow is delicate and perfectly steamed.',
        date: 'Jul 14, 2026',
      },
    ],
  },
  {
    id: 'rest-8',
    name: 'Pho House Vietnam',
    cuisine: 'Vietnamese • Pho • Banh Mi',
    rating: 4.7,
    reviewCount: 234,
    deliveryTime: '20-30 min',
    deliveryFee: '$1.99',
    distance: '1.8 mi',
    image:
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    description:
      'Slow-simmered 18-hour bone broth pho and crispy banh mi. The broth recipe has been passed down through four generations of the Nguyen family.',
    address: '93 Saigon Street, Tenderloin, San Francisco, CA 94102',
    gallery: [
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80',
    ],
    hours: [{ day: 'Mon – Sun', hours: '9:00 AM – 9:00 PM' }],
    reviews: [
      {
        id: 'rev-10',
        author: 'Linh T.',
        avatar: 'https://i.pravatar.cc/150?img=44',
        rating: 5,
        comment: 'The broth is so rich and complex. This is the real deal.',
        date: 'Jul 13, 2026',
      },
    ],
  },
  {
    id: 'rest-9',
    name: 'Sweet Tooth Bakery',
    cuisine: 'Desserts • Cakes • Coffee',
    rating: 4.9,
    reviewCount: 378,
    deliveryTime: '15-25 min',
    deliveryFee: 'Free',
    distance: '1.0 mi',
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    description:
      'Artisanal pastries, celebration cakes, and specialty coffee. Everything is baked fresh daily using traditional French pâtisserie techniques.',
    address: '16 Sugar Street, Hayes Valley, San Francisco, CA 94102',
    gallery: [
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
    ],
    hours: [
      { day: 'Tue – Fri', hours: '7:00 AM – 7:00 PM' },
      { day: 'Sat – Sun', hours: '8:00 AM – 5:00 PM' },
      { day: 'Monday', hours: 'Closed' },
    ],
    reviews: [
      {
        id: 'rev-11',
        author: 'Claire D.',
        avatar: 'https://i.pravatar.cc/150?img=23',
        rating: 5,
        comment: 'The croissants are incredible. Perfectly laminated, buttery, and flaky.',
        date: 'Jul 20, 2026',
      },
    ],
  },
  {
    id: 'rest-10',
    name: 'Bangkok Street Eats',
    cuisine: 'Thai • Pad Thai • Curry',
    rating: 4.6,
    reviewCount: 192,
    deliveryTime: '25-35 min',
    deliveryFee: '$2.49',
    distance: '2.7 mi',
    image:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    description:
      'Vibrant Thai street food straight from the night markets of Bangkok. Fiery curries, fragrant jasmine rice, and the best pad thai in the city.',
    address: '201 Thai Town Blvd, Richmond, San Francisco, CA 94118',
    gallery: [
      'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',
    ],
    hours: [{ day: 'Mon – Sun', hours: '11:00 AM – 10:00 PM' }],
    reviews: [
      {
        id: 'rev-12',
        author: 'Tom H.',
        avatar: 'https://i.pravatar.cc/150?img=68',
        rating: 5,
        comment: 'Ordered the green curry and pad see ew. Both were absolutely amazing.',
        date: 'Jul 16, 2026',
      },
    ],
  },
];
