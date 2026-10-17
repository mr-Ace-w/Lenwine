import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/db';
import { CLOTHING_TYPES } from '@/lib/products-data';

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lenwine.site';

  // 1. Static main pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/catalog?availability=IN_STOCK`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/catalog?availability=PREORDER`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // 2. Clothing type category pages
  const typeRoutes: MetadataRoute.Sitemap = CLOTHING_TYPES
    .filter(t => t.id !== 'all')
    .map(type => ({
      url: `${baseUrl}/catalog?type=${type.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    }));

  // 3. Dynamic Products & Brand landing pages
  let productRoutes: MetadataRoute.Sitemap = [];
  let brandRoutes: MetadataRoute.Sitemap = [];

  try {
    const products = await getProducts();

    // Unique brands
    const brandsSet = new Set<string>();
    products.forEach(p => {
      if (p.brand && p.brand.trim()) {
        brandsSet.add(p.brand.trim());
      }
    });

    brandRoutes = Array.from(brandsSet).map(brand => ({
      url: `${baseUrl}/catalog?brand=${encodeURIComponent(brand)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    }));

    // All product detail pages
    productRoutes = products.map(product => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (err) {
    console.error('Failed to generate product & brand sitemap entries:', err);
  }

  return [...staticRoutes, ...typeRoutes, ...brandRoutes, ...productRoutes];
}
