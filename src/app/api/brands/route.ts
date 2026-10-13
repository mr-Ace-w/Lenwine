import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/db';
import { DEFAULT_BRANDS } from '@/lib/products-data';

export async function GET() {
  try {
    const products = await getProducts();
    const productBrands = products
      .map(p => p.brand?.trim())
      .filter((b): b is string => Boolean(b));

    const allBrandsSet = new Set<string>([
      ...DEFAULT_BRANDS,
      ...productBrands
    ]);

    const sortedBrands = Array.from(allBrandsSet).sort((a, b) => {
      // Numbers first, then alphabetical (like 032C, 14TH ADDICTION, 20471120...)
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    return NextResponse.json(sortedBrands);
  } catch (error) {
    return NextResponse.json(DEFAULT_BRANDS);
  }
}
