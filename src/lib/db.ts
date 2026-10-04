import { initialProducts, initialOrders, ProductType, OrderType } from './products-data';
import { supabase } from './supabase';

let globalProducts: ProductType[] = [...initialProducts];
let globalOrders: OrderType[] = [...initialOrders];

export const getProducts = async (): Promise<ProductType[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(item => ({
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
      }
    } catch (err) {
      console.error('Supabase fetch error, using local fallback:', err);
    }
  }
  return globalProducts;
};

export const getProductById = async (id: string): Promise<ProductType | undefined> => {
  const all = await getProducts();
  return all.find(p => p.id === id);
};

export const createProduct = async (productData: Omit<ProductType, 'id'>): Promise<ProductType> => {
  const newId = `len-${Date.now().toString().slice(-5)}`;

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
        const created: ProductType = {
          id: data.id,
          name: data.name,
          price: Number(data.price),
          originalPrice: data.original_price ? Number(data.original_price) : undefined,
          category: data.category,
          description: data.description || '',
          images: Array.isArray(data.images) ? data.images : [data.images],
          sizes: Array.isArray(data.sizes) ? data.sizes : ['S', 'M', 'L'],
          inStock: data.in_stock,
          isFeatured: data.is_featured
        };
        globalProducts.unshift(created);
        return created;
      }
    } catch (err) {
      console.error('Supabase product create error:', err);
    }
  }

  const newProduct: ProductType = {
    ...productData,
    id: newId
  };
  globalProducts.unshift(newProduct);
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

  const index = globalProducts.findIndex(p => p.id === id);
  if (index === -1) return null;
  globalProducts[index] = { ...globalProducts[index], ...productData };
  return globalProducts[index];
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase delete error:', err);
    }
  }

  const initialLength = globalProducts.length;
  globalProducts = globalProducts.filter(p => p.id !== id);
  return globalProducts.length < initialLength;
};

export const getOrders = async (): Promise<OrderType[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(ord => ({
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
      }
    } catch (err) {
      console.error('Supabase orders fetch error:', err);
    }
  }
  return globalOrders;
};

export const createOrder = async (orderData: Omit<OrderType, 'id' | 'createdAt' | 'status'>): Promise<OrderType> => {
  const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

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
        const created: OrderType = {
          id: data.id,
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          customerPhone: data.customer_phone,
          shippingAddress: data.shipping_address,
          totalAmount: Number(data.total_amount),
          status: data.status,
          items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
          createdAt: data.created_at
        };
        globalOrders.unshift(created);
        return created;
      }
    } catch (err) {
      console.error('Supabase order create error:', err);
    }
  }

  const newOrder: OrderType = {
    ...orderData,
    id: newId,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  globalOrders.unshift(newOrder);
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

  const order = globalOrders.find(o => o.id === id);
  if (!order) return null;
  order.status = status;
  return order;
};
