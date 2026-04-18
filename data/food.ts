export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface FoodRestaurant {
  slug: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryFee: number;
  minOrder: number;
  tags: string[]; // kebap, pizza, burger vb.
  menu: MenuItem[];
  coverGradient: string;
  imageUrl?: string;
}

export const foodCategories = [
  { id: "all", label: "Tümü" },
  { id: "kebap", label: "Kebap" },
  { id: "pide", label: "Pide & Lahmacun" },
  { id: "burger", label: "Burger" },
  { id: "pizza", label: "Pizza" },
  { id: "doner", label: "Döner" },
  { id: "tatli", label: "Tatlı" },
  { id: "kahvalti", label: "Kahvaltı" },
  { id: "tavuk", label: "Tavuk" },
];

export const foodRestaurants: FoodRestaurant[] = [
  {
    slug: "koseoglu-kebap",
    name: "Köşeoğlu Kebap",
    cuisine: "Türk Mutfağı · Kebap",
    rating: 4.7,
    reviewCount: 1248,
    deliveryTimeMin: 30,
    deliveryFee: 15,
    minOrder: 100,
    tags: ["kebap"],
    coverGradient: "from-orange-500/70 to-red-600/70",
    imageUrl: "https://images.unsplash.com/photo-1529693662653-9d480da3337e?w=800",
    menu: [
      { id: "1", name: "Adana Kebap", description: "El çekimi, közde pişirilmiş", price: 185, category: "Kebaplar" },
      { id: "2", name: "Urfa Kebap", description: "Acısız, közde pişirilmiş", price: 185, category: "Kebaplar" },
      { id: "3", name: "Kuzu Şiş", description: "Marine kuzu kuşbaşı", price: 240, category: "Kebaplar" },
      { id: "4", name: "Tavuk Şiş", description: "Marine tavuk kuşbaşı", price: 160, category: "Kebaplar" },
      { id: "5", name: "Lahmacun", description: "İnce hamur, köy tereyağı", price: 45, category: "Pide & Lahmacun" },
      { id: "6", name: "Karışık Pide", description: "Kaşar, sucuk, mantar", price: 165, category: "Pide & Lahmacun" },
      { id: "7", name: "Künefe", description: "Antep fıstığıyla, sıcak", price: 90, category: "Tatlılar" },
    ],
  },
  {
    slug: "pizza-istanbul",
    name: "Pizza İstanbul",
    cuisine: "İtalyan · Pizza",
    rating: 4.5,
    reviewCount: 892,
    deliveryTimeMin: 25,
    deliveryFee: 12,
    minOrder: 80,
    tags: ["pizza"],
    coverGradient: "from-rose-500/70 to-orange-500/70",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    menu: [
      { id: "1", name: "Margherita", description: "Domates, mozzarella, fesleğen", price: 145, category: "Pizzalar" },
      { id: "2", name: "Pepperoni", description: "Sucuk dilimleri, kaşar", price: 175, category: "Pizzalar" },
      { id: "3", name: "Vegan", description: "Mantar, biber, zeytin, domates", price: 160, category: "Pizzalar" },
      { id: "4", name: "Karides", description: "Karides, sarımsak, zeytin", price: 210, category: "Pizzalar" },
      { id: "5", name: "Patates Kızartması", description: "Taze doğranmış", price: 55, category: "Yan Ürünler" },
      { id: "6", name: "Coca-Cola 1L", description: "Soğuk servis", price: 35, category: "İçecekler" },
    ],
  },
  {
    slug: "burger-house",
    name: "Burger House Gebze",
    cuisine: "Amerikan · Burger",
    rating: 4.6,
    reviewCount: 2104,
    deliveryTimeMin: 20,
    deliveryFee: 10,
    minOrder: 90,
    tags: ["burger"],
    coverGradient: "from-amber-500/70 to-red-500/70",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    menu: [
      { id: "1", name: "Classic Burger", description: "120gr dana, cheddar, marul, domates", price: 150, category: "Burgerler" },
      { id: "2", name: "Double Cheese", description: "2x120gr dana, çift peynir", price: 210, category: "Burgerler" },
      { id: "3", name: "Chicken Royale", description: "Tavuk göğüs, mayonez, turşu", price: 140, category: "Burgerler" },
      { id: "4", name: "BBQ Bacon", description: "BBQ sos, kıtır bacon", price: 220, category: "Burgerler" },
      { id: "5", name: "Patates", description: "Kıtır patates kızartması", price: 45, category: "Yan Ürünler" },
      { id: "6", name: "Soğan Halkası", description: "Beyaz soğan, panelenmiş", price: 55, category: "Yan Ürünler" },
    ],
  },
  {
    slug: "doner-dunya",
    name: "Döner Dünyası",
    cuisine: "Türk Mutfağı · Döner",
    rating: 4.4,
    reviewCount: 523,
    deliveryTimeMin: 15,
    deliveryFee: 8,
    minOrder: 60,
    tags: ["doner"],
    coverGradient: "from-yellow-500/70 to-orange-600/70",
    imageUrl: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800",
    menu: [
      { id: "1", name: "Et Döner Dürüm", description: "El açması yufka, dana döner", price: 120, category: "Dürümler" },
      { id: "2", name: "Tavuk Döner Dürüm", description: "Tavuk döner, taze sebze", price: 95, category: "Dürümler" },
      { id: "3", name: "İskender", description: "Tereyağlı pide üstü, domates sos", price: 185, category: "Tabaklar" },
      { id: "4", name: "Ayran Büyük", description: "500ml", price: 25, category: "İçecekler" },
    ],
  },
  {
    slug: "kahvalti-durak",
    name: "Kahvaltı Durağı",
    cuisine: "Kahvaltı · Brunch",
    rating: 4.8,
    reviewCount: 734,
    deliveryTimeMin: 35,
    deliveryFee: 20,
    minOrder: 150,
    tags: ["kahvalti"],
    coverGradient: "from-amber-400/70 to-yellow-600/70",
    imageUrl: "https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=800",
    menu: [
      { id: "1", name: "Serpme Kahvaltı (2 Kişi)", description: "30+ çeşit, çay dahil", price: 595, category: "Kahvaltı" },
      { id: "2", name: "Menemen", description: "Kaşar, sucuklu", price: 145, category: "Sıcaklar" },
      { id: "3", name: "Sucuklu Yumurta", description: "Tava sucuk, 2 yumurta", price: 120, category: "Sıcaklar" },
    ],
  },
  {
    slug: "tatli-dunyasi",
    name: "Tatlı Dünyası",
    cuisine: "Tatlı · Baklava",
    rating: 4.9,
    reviewCount: 1890,
    deliveryTimeMin: 40,
    deliveryFee: 15,
    minOrder: 100,
    tags: ["tatli"],
    coverGradient: "from-pink-500/70 to-rose-600/70",
    imageUrl: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800",
    menu: [
      { id: "1", name: "Antep Fıstıklı Baklava (500g)", description: "Geleneksel usul", price: 320, category: "Baklavalar" },
      { id: "2", name: "Sütlaç", description: "Fırın sütlaç", price: 65, category: "Sütlü Tatlılar" },
      { id: "3", name: "Kadayıf", description: "Cevizli tel kadayıf", price: 180, category: "Şerbetli Tatlılar" },
    ],
  },
  {
    slug: "tavuk-dunyasi",
    name: "Tavuk Dünyası Gebze",
    cuisine: "Fast Food · Tavuk",
    rating: 4.3,
    reviewCount: 1120,
    deliveryTimeMin: 22,
    deliveryFee: 10,
    minOrder: 75,
    tags: ["tavuk"],
    coverGradient: "from-lime-500/70 to-emerald-600/70",
    imageUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800",
    menu: [
      { id: "1", name: "Tavuk Döner Menu", description: "Dürüm, patates, içecek", price: 155, category: "Menüler" },
      { id: "2", name: "Kanat (6'lı)", description: "Marine kanat", price: 125, category: "À La Carte" },
      { id: "3", name: "Nugget (8'li)", description: "Çocuk dostu", price: 95, category: "À La Carte" },
    ],
  },
];
