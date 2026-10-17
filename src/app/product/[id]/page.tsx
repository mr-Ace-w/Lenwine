import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Товар не знайдено',
      description: 'Цей товар відсутній у каталозі LENWINE.',
      robots: { index: false, follow: true },
    };
  }

  const brandName = product.brand ? `${product.brand} ` : '';
  const title = `${brandName}${product.name} — Купити в Україні | LENWINE Archive`;
  const cleanDescription = product.description
    ? product.description.replace(/\n+/g, ' ').slice(0, 155)
    : `Оригінальний брендовий одяг ${product.name} за ціною ${product.price.toLocaleString('uk-UA')} ₴. В наявності та під замовлення в інтернет-магазині LENWINE.`;

  const primaryImage = product.images?.[0] || 'https://lenwine.site/logo-black.png';

  return {
    title,
    description: cleanDescription,
    keywords: [
      product.name,
      product.brand || 'LENWINE',
      product.category,
      'купити одяг',
      'брендовий одяг україна',
      'архівна мода',
      'streetwear київ',
      'оригінальний одяг',
    ],
    alternates: {
      canonical: `https://lenwine.site/product/${product.id}`,
    },
    openGraph: {
      title,
      description: cleanDescription,
      url: `https://lenwine.site/product/${product.id}`,
      siteName: 'LENWINE',
      images: product.images.slice(0, 4).map(img => ({
        url: img,
        width: 1000,
        height: 1333,
        alt: `${product.name} - LENWINE`,
      })),
      locale: 'uk_UA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: cleanDescription,
      images: [primaryImage],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  const allProducts = await getProducts();

  if (!product) {
    notFound();
  }

  const baseUrl = 'https://lenwine.site';
  const productUrl = `${baseUrl}/product/${product.id}`;
  const brandName = product.brand || 'LENWINE';

  // Google Rich Snippet (Product Schema JSON-LD)
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description || `${product.name} від ${brandName}`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'UAH',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      seller: {
        '@type': 'Organization',
        name: 'LENWINE',
        url: baseUrl,
      },
    },
  };

  // Google Breadcrumb Schema JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Головна',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Каталог',
        item: `${baseUrl}/catalog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      {/* Schema.org Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <ProductDetailClient
        initialProduct={product}
        initialAllProducts={allProducts}
      />
    </>
  );
}
