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
    id: "len-96059",
    name: "erd hoddie",
    price: 2900,
    category: "MEN",
    description: "",
    images: [
      "https://firebasestorage.googleapis.com/v0/b/deaddropua-com.firebasestorage.app/o/products%2F1790446935964_photo_7_2026-09-26_19-14-48.webp?alt=media&token=e0a3b783-6d9c-4853-b966-6a5298f5ef60",
      "https://firebasestorage.googleapis.com/v0/b/deaddropua-com.firebasestorage.app/o/products%2F1790446936045_photo_8_2026-09-26_19-14-48.webp?alt=media&token=545fb3f6-6f95-436e-bec9-45a712e69e23"
    ],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    isFeatured: true
  }
];

export const initialOrders: OrderType[] = [];
