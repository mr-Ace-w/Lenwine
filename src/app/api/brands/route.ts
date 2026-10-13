import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/db';

export async function GET() {
  try {
    const products = await getProducts();
    const productBrands: string[] = [];

    for (const p of products) {
      if (p.brand?.trim()) {
        productBrands.push(p.brand.trim());
      } else if (p.name) {
        // Fallback: detect brand in name if not explicitly set
        const nameUpper = p.name.toUpperCase();
        if (nameUpper.includes('BALENCIAGA')) {
          productBrands.push('BALENCIAGA');
        } else if (nameUpper.includes('ERD') || nameUpper.includes('ENFANTS')) {
          productBrands.push('ENFANTS RICHES DÉPRIMÉS');
        } else if (nameUpper.includes('SAINT LAURENT')) {
          productBrands.push('SAINT LAURENT');
        }
      }
    }

    // Only unique brands that currently exist on the site
    const allBrandsSet = new Set<string>(productBrands);

    const sortedBrands = Array.from(allBrandsSet).sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    return NextResponse.json(sortedBrands);
  } catch (error) {
    return NextResponse.json([]);
  }
}
