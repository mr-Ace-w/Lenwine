import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Каталог архівного одягу та взуття — Rick Owens, Balenciaga, ERD',
  description: 'Повний каталог преміального архівного одягу та взуття LENWINE. Більше 600 ексклюзивних позицій в наявності та під замовлення: худі, джинси, куртки, черевики та аксесуари.',
  keywords: [
    'каталог брендового одягу',
    'купити rick owens україна',
    'купити balenciaga',
    'enfants riches deprimes україна',
    'chrome hearts україна',
    'архівний одяг київ',
    'vintage archive fashion',
    'під замовлення бренди',
  ],
  alternates: {
    canonical: 'https://lenwine.site/catalog',
  },
  openGraph: {
    title: 'Каталог архівного одягу та взуття | LENWINE Archive',
    description: 'Ексклюзивний архівний одяг та взуття: Rick Owens, Balenciaga, ERD, Chrome Hearts, Maison Margiela. Доставка по Україні.',
    url: 'https://lenwine.site/catalog',
    siteName: 'LENWINE',
    images: [
      {
        url: '/logo-black.png',
        width: 1200,
        height: 630,
        alt: 'Каталог LENWINE',
      },
    ],
    locale: 'uk_UA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Каталог архівного одягу та взуття | LENWINE Archive',
    description: 'Купити брендовий архівний одяг та взуття в Україні.',
    images: ['/logo-black.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Каталог архівного одягу та взуття LENWINE',
    description: 'Ексклюзивний архівний одяг та взуття: Rick Owens, Balenciaga, ERD, Chrome Hearts. В наявності та під замовлення.',
    url: 'https://lenwine.site/catalog',
    isPartOf: {
      '@type': 'WebSite',
      name: 'LENWINE',
      url: 'https://lenwine.site',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Головна',
        item: 'https://lenwine.site',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Каталог',
        item: 'https://lenwine.site/catalog',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
