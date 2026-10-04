import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'LENWINE — High Fashion Couture',
  description: 'Exclusive Zara-inspired luxury clothing store featuring Enfants Riches Déprimés typography.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="antialiased bg-white text-black font-sans">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
