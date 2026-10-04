import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Parse image URLs: support array or comma/newline separated string
    let parsedImages: string[] = [];
    if (Array.isArray(body.images)) {
      parsedImages = body.images.filter(Boolean);
    } else if (typeof body.images === 'string') {
      parsedImages = body.images
        .split(/[\n,]+/)
        .map((url: string) => url.trim())
        .filter(Boolean);
    }

    if (parsedImages.length === 0) {
      parsedImages = ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1000"];
    }

    const newProduct = await createProduct({
      name: body.name,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      category: body.category || 'MEN',
      description: body.description || '',
      images: parsedImages,
      sizes: Array.isArray(body.sizes)
        ? body.sizes
        : (body.sizes ? body.sizes.split(',').map((s: string) => s.trim()) : ['S', 'M', 'L']),
      inStock: body.inStock !== false,
      isFeatured: Boolean(body.isFeatured),
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 400 });
  }
}
