import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://lenwine.site'),
  title: {
    default: 'LENWINE — High Fashion Couture Archive',
    template: '%s | LENWINE',
  },
  description: 'Exclusive archive luxury clothing store featuring Rick Owens, Balenciaga, ERD, Chrome Hearts, Undercover and Maison Margiela. In-stock & individual pre-orders.',
  keywords: ['LENWINE', 'archive fashion', 'Rick Owens', 'Balenciaga', 'ERD', 'Chrome Hearts', 'Undercover', 'luxury streetwear', 'купити одяг', 'архівний одяг'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LENWINE — High Fashion Couture Archive',
    description: 'Exclusive archive luxury clothing store featuring Rick Owens, Balenciaga, ERD, Chrome Hearts, Undercover.',
    url: 'https://lenwine.site',
    siteName: 'LENWINE',
    images: [
      {
        url: '/logo-black.png',
        width: 1200,
        height: 630,
        alt: 'LENWINE Archive',
      },
    ],
    locale: 'uk_UA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LENWINE — High Fashion Couture Archive',
    description: 'Exclusive archive luxury clothing store.',
    images: ['/logo-black.png'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LENWINE',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'LENWINE',
    alternateName: 'LENWINE Archive',
    url: 'https://lenwine.site',
    logo: 'https://lenwine.site/logo-black.png',
    image: 'https://lenwine.site/logo-black.png',
    description: 'Магазин преміального архівного одягу та взуття: Rick Owens, Balenciaga, ERD, Chrome Hearts, Maison Margiela. Доставка по Україні.',
    sameAs: ['https://t.me/flockawerty'],
    currenciesAccepted: 'UAH',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    priceRange: '$$$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UA',
    },
  };

  const webSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LENWINE',
    url: 'https://lenwine.site',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://lenwine.site/catalog?brand={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="uk" className="bg-black">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      <body className="antialiased bg-black text-white font-sans">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
