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
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
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

function parseMetaFromDescription(descriptionRaw: string | null | undefined): {
  description: string;
  brand?: string;
  clothingType?: string;
} {
  if (!descriptionRaw) return { description: '' };
  const metaMatch = descriptionRaw.match(/<!--meta:([\s\S]*?)-->/);
  if (metaMatch) {
    try {
      const parsed = JSON.parse(metaMatch[1]);
      const cleanDesc = descriptionRaw.replace(/<!--meta:[\s\S]*?-->/g, '').trim();
      return {
        description: cleanDesc,
        brand: parsed.brand || undefined,
        clothingType: parsed.clothingType || undefined
      };
    } catch {
      // Ignore parse error
    }
  }
  return { description: descriptionRaw };
}

function buildDescriptionWithMeta(description: string | undefined, brand: string | undefined, clothingType: string | undefined): string {
  const clean = (description || '').replace(/<!--meta:[\s\S]*?-->/g, '').trim();
  if (!brand && !clothingType) return clean;
  const metaStr = `<!--meta:${JSON.stringify({ brand: brand || '', clothingType: clothingType || '' })}-->`;
  return clean ? `${metaStr}\n${clean}` : metaStr;
}

export const getProducts = async (): Promise<ProductType[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const localMap = new Map(readLocalProducts().map(p => [p.id, p]));
        const formatted: ProductType[] = data.map(item => {
          const local = localMap.get(item.id);
          const { description: cleanDesc, brand: metaBrand, clothingType: metaClothingType } = parseMetaFromDescription(item.description);

          let detectedBrand = item.brand || metaBrand || local?.brand;
          if (!detectedBrand && item.name) {
            const nameUpper = item.name.toUpperCase();
            if (nameUpper.includes('BALENCIAGA')) detectedBrand = 'BALENCIAGA';
            else if (nameUpper.includes('ERD') || nameUpper.includes('ENFANTS')) detectedBrand = 'ENFANTS RICHES DÉPRIMÉS';
            else if (nameUpper.includes('SAINT LAURENT')) detectedBrand = 'SAINT LAURENT';
            else if (nameUpper.includes('HYSTERIC')) detectedBrand = 'HYSTERIC GLAMOUR';
          }

          let detectedType = item.clothing_type || item.clothingType || metaClothingType || local?.clothingType;
          if (!detectedType && item.name) {
            const nameLower = item.name.toLowerCase();
            if (nameLower.includes('boot') || nameLower.includes('shoe') || nameLower.includes('sneaker')) detectedType = 'shoes';
            else if (nameLower.includes('jean') || nameLower.includes('pant')) detectedType = 'pants';
            else if (nameLower.includes('jacket') || nameLower.includes('coat')) detectedType = 'jackets';
            else if (nameLower.includes('sweater') || nameLower.includes('hoodie') || nameLower.includes('hoddie')) detectedType = 'sweaters';
            else if (nameLower.includes('tee') || nameLower.includes('shirt')) detectedType = 'tshirts';
          }

          return {
            id: item.id,
            name: item.name,
            price: Number(item.price),
            originalPrice: item.original_price ? Number(item.original_price) : undefined,
            category: item.category,
            brand: detectedBrand || undefined,
            clothingType: detectedType || undefined,
            description: cleanDesc,
            images: Array.isArray(item.images) ? item.images : (typeof item.images === 'string' ? JSON.parse(item.images) : [item.images]),
            sizes: Array.isArray(item.sizes) ? item.sizes : (typeof item.sizes === 'string' ? item.sizes.split(',') : ['S', 'M', 'L']),
            inStock: item.in_stock !== false,
            isFeatured: Boolean(item.is_featured)
          };
        });
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
      const dbDescription = buildDescriptionWithMeta(
        productData.description,
        productData.brand,
        productData.clothingType
      );

      const payload: Record<string, any> = {
        id: newId,
        name: productData.name,
        price: productData.price,
        original_price: productData.originalPrice || null,
        category: productData.category,
        description: dbDescription,
        images: productData.images,
        sizes: productData.sizes,
        in_stock: productData.inStock,
        is_featured: productData.isFeatured
      };

      const { data, error } = await supabase.from('products').insert([payload]).select().single();

      if (error) {
        console.error('Supabase product insert error:', error.message);
      } else if (data) {
        console.log('Product created in Supabase DB:', data.id);
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
  let updatedProduct: ProductType | null = null;

  // 1. First update in Supabase
  if (supabase) {
    try {
      const dbDescription = buildDescriptionWithMeta(
        productData.description,
        productData.brand,
        productData.clothingType
      );

      const payload: Record<string, any> = {};
      if (productData.name !== undefined) payload.name = productData.name;
      if (productData.price !== undefined) payload.price = productData.price;
      if (productData.originalPrice !== undefined) payload.original_price = productData.originalPrice;
      if (productData.category !== undefined) payload.category = productData.category;
      if (productData.description !== undefined || productData.brand !== undefined || productData.clothingType !== undefined) {
        payload.description = dbDescription;
      }
      if (productData.images !== undefined) payload.images = productData.images;
      if (productData.sizes !== undefined) payload.sizes = productData.sizes;
      if (productData.inStock !== undefined) payload.in_stock = productData.inStock;
      if (productData.isFeatured !== undefined) payload.is_featured = productData.isFeatured;

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (!error && data) {
        const { description: cleanDesc, brand: metaBrand, clothingType: metaClothingType } = parseMetaFromDescription(data.description);
        updatedProduct = {
          id: data.id,
          name: data.name,
          price: Number(data.price),
          originalPrice: data.original_price ? Number(data.original_price) : undefined,
          category: data.category,
          brand: metaBrand || productData.brand,
          clothingType: metaClothingType || productData.clothingType,
          description: cleanDesc,
          images: Array.isArray(data.images) ? data.images : (typeof data.images === 'string' ? JSON.parse(data.images) : [data.images]),
          sizes: Array.isArray(data.sizes) ? data.sizes : (typeof data.sizes === 'string' ? data.sizes.split(',') : ['S', 'M', 'L']),
          inStock: data.in_stock !== false,
          isFeatured: Boolean(data.is_featured)
        };
      } else if (error) {
        console.error('Supabase update failed:', error.message);
      }
    } catch (err) {
      console.error('Supabase update exception:', err);
    }
  }

  // 2. Also update local disk storage if possible
  try {
    const current = readLocalProducts();
    const index = current.findIndex(p => p.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...productData };
      writeLocalProducts(current);
      if (!updatedProduct) updatedProduct = current[index];
    } else if (updatedProduct) {
      writeLocalProducts([updatedProduct, ...current]);
    }
  } catch (err) {
    console.error('Local update error:', err);
  }

  // 3. If updated in Supabase or local, return immediately
  if (updatedProduct) {
    return updatedProduct;
  }

  // 4. Fallback: query all products to see if it exists
  const all = await getProducts();
  const existing = all.find(p => p.id === id);
  if (existing) {
    return { ...existing, ...productData };
  }

  return null;
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

export const reorderProducts = async (orderedIds: string[]): Promise<ProductType[]> => {
  const current = await getProducts();
  const idMap = new Map(current.map(p => [p.id, p]));
  const reordered: ProductType[] = [];

  for (const id of orderedIds) {
    const item = idMap.get(id);
    if (item) {
      reordered.push(item);
      idMap.delete(id);
    }
  }
  for (const item of idMap.values()) {
    reordered.push(item);
  }

  writeLocalProducts(reordered);

  if (supabase) {
    try {
      const baseTime = Date.now();
      for (let i = 0; i < reordered.length; i++) {
        const prod = reordered[i];
        const newCreatedAt = new Date(baseTime - i * 1000).toISOString();
        await supabase.from('products').update({ created_at: newCreatedAt }).eq('id', prod.id);
      }
    } catch (err) {
      console.error('Supabase reorder error:', err);
    }
  }

  return reordered;
};

export const getOrders = async (): Promise<OrderType[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
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
