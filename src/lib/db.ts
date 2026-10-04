import { initialProducts, initialOrders, ProductType, OrderType } from './products-data';

// Server-side / in-memory store fallback for seamless operation
let globalProducts: ProductType[] = [...initialProducts];
let globalOrders: OrderType[] = [...initialOrders];

export const getProducts = async (): Promise<ProductType[]> => {
  return globalProducts;
};

export const getProductById = async (id: string): Promise<ProductType | undefined> => {
  return globalProducts.find(p => p.id === id);
};

export const createProduct = async (productData: Omit<ProductType, 'id'>): Promise<ProductType> => {
  const newProduct: ProductType = {
    ...productData,
    id: `len-${Date.now().toString().slice(-5)}`
  };
  globalProducts.unshift(newProduct);
  return newProduct;
};

export const updateProduct = async (id: string, productData: Partial<ProductType>): Promise<ProductType | null> => {
  const index = globalProducts.findIndex(p => p.id === id);
  if (index === -1) return null;
  globalProducts[index] = { ...globalProducts[index], ...productData };
  return globalProducts[index];
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const initialLength = globalProducts.length;
  globalProducts = globalProducts.filter(p => p.id !== id);
  return globalProducts.length < initialLength;
};

export const getOrders = async (): Promise<OrderType[]> => {
  return globalOrders;
};

export const createOrder = async (orderData: Omit<OrderType, 'id' | 'createdAt' | 'status'>): Promise<OrderType> => {
  const newOrder: OrderType = {
    ...orderData,
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  globalOrders.unshift(newOrder);
  return newOrder;
};

export const updateOrderStatus = async (id: string, status: OrderType['status']): Promise<OrderType | null> => {
  const order = globalOrders.find(o => o.id === id);
  if (!order) return null;
  order.status = status;
  return order;
};
