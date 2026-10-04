export interface ProductType {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  images: string[];
  sizes: string[];
  inStock: boolean;
  isFeatured: boolean;
}

export interface OrderType {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: {
    productId: string;
    name: string;
    size: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  createdAt: string;
}

export const initialProducts: ProductType[] = [
  {
    id: "len-001",
    name: "LENWINE DISTRESSED LEATHER BIKER JACKET",
    price: 18900,
    originalPrice: 22000,
    category: "MEN",
    description: "Premium washed lambskin leather jacket featuring hand-distressed detailing, custom silver hardware, and signature oversized silhouette inspired by punk couture aesthetics.",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000"
    ],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    isFeatured: true
  },
  {
    id: "len-002",
    name: "ENFANTS EMBROIDERY SILK DRESS SHIRT",
    price: 8400,
    category: "MEN",
    description: "100% Mulberry silk woven shirt with raw edge embroidery detailing along the cuffs and classic point collar. Ultra-refined draping.",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=1000"
    ],
    sizes: ["S", "M", "L"],
    inStock: true,
    isFeatured: true
  },
  {
    id: "len-003",
    name: "OVERSIZED ARCHIVAL DESTRUCTED HOODIE",
    price: 7200,
    originalPrice: 8900,
    category: "WOMEN",
    description: "Heavyweight 460GSM French terry cotton hoodie with micro-abrasions, raw frayed hems, and subtle vintage tonal enzyme wash.",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=1000"
    ],
    sizes: ["XS", "S", "M", "L"],
    inStock: true,
    isFeatured: true
  },
  {
    id: "len-004",
    name: "TAILORED DOUBLE-BREASTED WOOL OVERCOAT",
    price: 24500,
    category: "WOMEN",
    description: "Structured double-breasted coat in pure Italian virgin wool. Sculpted shoulders, deep notched lapels, and full silk lining.",
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000"
    ],
    sizes: ["S", "M", "L"],
    inStock: true,
    isFeatured: true
  },
  {
    id: "len-005",
    name: "RAW-EDGE PLEATED TAILORED TROUSERS",
    price: 6800,
    category: "MEN",
    description: "Relaxed fit pleated trousers with subtle high waist cut, unfinished hem option, and refined wool blend texture.",
    images: [
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=1000"
    ],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    isFeatured: false
  },
  {
    id: "len-006",
    name: "LEATHER CHUNKY PLATFORM COMBAT BOOTS",
    price: 13500,
    category: "ACCESSORIES",
    description: "Full-grain calfskin leather boots with exaggerated lugged soles, reinforced steel toe box detail, and brushed silver eyelets.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=1000"
    ],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    inStock: true,
    isFeatured: true
  }
];

export const initialOrders: OrderType[] = [
  {
    id: "ORD-9281",
    customerName: "Олександр Коваленко",
    customerEmail: "o.kovalenko@gmail.com",
    customerPhone: "+380 67 123 4567",
    shippingAddress: "м. Київ, Нова Пошта №15, вул. Хрещатик 22",
    totalAmount: 18900,
    status: "Processing",
    createdAt: "2026-10-02T14:32:00.000Z",
    items: [
      {
        productId: "len-001",
        name: "LENWINE DISTRESSED LEATHER BIKER JACKET",
        size: "L",
        quantity: 1,
        price: 18900,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1000"
      }
    ]
  }
];
