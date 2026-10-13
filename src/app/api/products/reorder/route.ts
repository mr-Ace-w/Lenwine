import { NextResponse } from 'next/server';
import { reorderProducts } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds must be an array of string IDs' }, { status: 400 });
    }

    const reordered = await reorderProducts(orderedIds);
    return NextResponse.json(reordered);
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder products' }, { status: 500 });
  }
}
