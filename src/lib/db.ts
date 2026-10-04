import fs from 'fs';
import path from 'path';
import { initialProducts, initialOrders, ProductType, OrderType } from './products-data';
import { supabase } from './supabase';

const productsFilePath = path.join(process.cwd(), 'src/data/products.json');
const ordersFilePath = path.join(process.cwd(), 'src/data/orders.json');

function readLocalProducts(): ProductType[] {
  try {
    if (fs.existsSync(productsFilePath)) {
      const data = fs.readFileSync(productsFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local products.json:', err);
  }
  return initialProducts;
}

function writeLocalProducts(products: ProductType[]) {
  try {
    const dir = path.dirname(productsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local products.json:', err);
  }
}

function readLocalOrders(): OrderType[] {
  try {
    if (fs.existsSync(ordersFilePath)) {
      const data = fs.readFileSync(ordersFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local orders.json:', err);
  }
  return initialOrders;
}

function writeLocalOrders(orders: OrderType[]) {
  try {
    const dir = path.dirname(ordersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local orders.json:', err);
  }
}

export const getProducts = async (): Promise<ProductType[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const formatted: ProductType[] = data.map(item => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : undefined,
          category: item.category,
          description: item.description || '',
          images: Array.isArray(item.images) ? item.images : (typeof item.images === 'string' ? JSON.parse(item.images) : [item.images]),
          sizes: Array.isArray(item.sizes) ? item.sizes : (typeof item.sizes === 'string' ? item.sizes.split(',') : ['S', 'M', 'L']),
          inStock: item.in_stock !== false,
          isFeatured: Boolean(item.is_featured)
        }));
        writeLocalProducts(formatted);
        return formatted;
      }
    } catch (err) {
      console.error('Supabase fetch error, using local file:', err);
    }
  }
  return readLocalProducts();
};

export const getProductById = async (id: string): Promise<ProductType | undefined> => {
  const all = await getProducts();
  return all.find(p => p.id === id);
};

export const createProduct = async (productData: Omit<ProductType, 'id'>): Promise<ProductType> => {
  const newId = `len-${Date.now().toString().slice(-5)}`;
  const newProduct: ProductType = {
    ...productData,
    id: newId
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').insert([
        {
          id: newId,
          name: productData.name,
          price: productData.price,
          original_price: productData.originalPrice || null,
          category: productData.category,
          description: productData.description,
          images: productData.images,
          sizes: productData.sizes,
          in_stock: productData.inStock,
          is_featured: productData.isFeatured
        }
      ]).select().single();

      if (!error && data) {
        console.log('Product created in Supabase DB:', data.id);
      } else {
        console.warn('Supabase insert warning (falling back to disk JSON):', error?.message);
      }
    } catch (err) {
      console.error('Supabase product create error:', err);
    }
  }

  // Update local disk storage
  const current = readLocalProducts();
  const updated = [newProduct, ...current];
  writeLocalProducts(updated);

  return newProduct;
};

export const updateProduct = async (id: string, productData: Partial<ProductType>): Promise<ProductType | null> => {
  if (supabase) {
    try {
      await supabase.from('products').update({
        name: productData.name,
        price: productData.price,
        original_price: productData.originalPrice,
        category: productData.category,
        description: productData.description,
        images: productData.images,
        sizes: productData.sizes,
        in_stock: productData.inStock,
        is_featured: productData.isFeatured
      }).eq('id', id);
    } catch (err) {
      console.error('Supabase update error:', err);
    }
  }

  const current = readLocalProducts();
  const index = current.findIndex(p => p.id === id);
  if (index === -1) return null;
  current[index] = { ...current[index], ...productData };
  writeLocalProducts(current);

  return current[index];
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete warning:', error.message);
      }
    } catch (err) {
      console.error('Supabase delete error:', err);
    }
  }

  const current = readLocalProducts();
  const updated = current.filter(p => p.id !== id);
  writeLocalProducts(updated);

  return true;
};

export const getOrders = async (): Promise<OrderType[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const formatted: OrderType[] = data.map(ord => ({
          id: ord.id,
          customerName: ord.customer_name,
          customerEmail: ord.customer_email,
          customerPhone: ord.customer_phone,
          shippingAddress: ord.shipping_address,
          totalAmount: Number(ord.total_amount),
          status: ord.status,
          items: typeof ord.items === 'string' ? JSON.parse(ord.items) : ord.items,
          createdAt: ord.created_at
        }));
        writeLocalOrders(formatted);
        return formatted;
      }
    } catch (err) {
      console.error('Supabase orders fetch error:', err);
    }
  }
  return readLocalOrders();
};

export const createOrder = async (orderData: Omit<OrderType, 'id' | 'createdAt' | 'status'>): Promise<OrderType> => {
  const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: OrderType = {
    ...orderData,
    id: newId,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').insert([
        {
          id: newId,
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          customer_phone: orderData.customerPhone,
          shipping_address: orderData.shippingAddress,
          total_amount: orderData.totalAmount,
          status: 'Pending',
          items: orderData.items
        }
      ]).select().single();

      if (!error && data) {
        console.log('Order created in Supabase DB:', data.id);
      }
    } catch (err) {
      console.error('Supabase order create error:', err);
    }
  }

  const current = readLocalOrders();
  const updated = [newOrder, ...current];
  writeLocalOrders(updated);

  return newOrder;
};

export const updateOrderStatus = async (id: string, status: OrderType['status']): Promise<OrderType | null> => {
  if (supabase) {
    try {
      await supabase.from('orders').update({ status }).eq('id', id);
    } catch (err) {
      console.error('Supabase order status error:', err);
    }
  }

  const current = readLocalOrders();
  const order = current.find(o => o.id === id);
  if (!order) return null;
  order.status = status;
  writeLocalOrders(current);

  return order;
};
