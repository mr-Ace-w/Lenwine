import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';

export async function GET() {
  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newOrder = await createOrder(body);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 400 });
  }
}
