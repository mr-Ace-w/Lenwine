'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import QuickViewModal from '@/components/QuickViewModal';
import CheckoutModal from '@/components/CheckoutModal';
import { ProductType } from '@/lib/products-data';

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);

  React.useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(console.error);
  }, []);

  return (
    <main className="min-h-screen bg-white text-black flex flex-col selection:bg-black selection:text-white">
      {/* Completely Transparent Floating Header overlaying Hero */}
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      {/* Pure Editorial Lookbook Hero - 2 SIDE-BY-SIDE ARTWORK PHOTOS */}
      <section className="relative min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
        {/* Left Column - BLUE ARTWORK (ALL PRODUCTS) */}
        <Link
          href="/catalog"
          className="group relative h-screen w-full overflow-hidden bg-neutral-950 cursor-pointer"
        >
          <Image
            src="/hero-blue.jpg"
            alt="ALL PRODUCTS - LENWINE BLUE"
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

          {/* Collection Title Overlay on Photo */}
          <div className="absolute bottom-10 left-10 sm:bottom-14 sm:left-14 z-10">
            <span className="text-white font-extrabold text-lg sm:text-2xl tracking-[0.2em] uppercase group-hover:underline underline-offset-8 drop-shadow-lg">
              ALL PRODUCTS
            </span>
            <span className="block text-[10px] text-neutral-300 font-mono tracking-[0.3em] uppercase mt-1">
              DISCOVER FULL CATALOG
            </span>
          </div>
        </Link>

        {/* Right Column - RED ARTWORK (SELECT COLLECTION) */}
        <Link
          href="/catalog?category=MEN"
          className="group relative h-screen w-full overflow-hidden bg-neutral-950 cursor-pointer"
        >
          <Image
            src="/hero-red.jpg"
            alt="SELECT COLLECTION - LENWINE RED"
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

          {/* Collection Title Overlay on Photo */}
          <div className="absolute bottom-10 right-10 sm:bottom-14 sm:right-14 z-10 text-right">
            <span className="text-white font-extrabold text-lg sm:text-2xl tracking-[0.2em] uppercase group-hover:underline underline-offset-8 drop-shadow-lg">
              SELECT COLLECTION
            </span>
            <span className="block text-[10px] text-neutral-300 font-mono tracking-[0.3em] uppercase mt-1">
              AUTUMN / WINTER 2026
            </span>
          </div>
        </Link>
      </section>

      {/* Secondary Editorial Campaign Showcase Section */}
      <section className="bg-neutral-950 text-white py-28 px-6 sm:px-12 border-t border-neutral-900">
        <div className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-mono tracking-[0.35em] text-neutral-500 uppercase">
              ENFANTS RICHES DÉPRIMÉS ESTHÉTIQUE
            </span>
            <h2 className="font-erd-logo text-3xl sm:text-5xl tracking-[0.2em] uppercase text-white leading-tight">
              LENWINE ARCHIVE
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed tracking-wider font-sans">
              HIGH FASHION PUNK COUTURE. EXCLUSIVE CUTS & VINTAGE DISTRESSED APPAREL CREATED WITH PARISIAN SILKS AND ITALIAN VIRGIN WOOL.
            </p>
            <div className="pt-4">
              <Link
                href="/catalog"
                className="inline-block bg-white text-black px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase hover:bg-neutral-200 transition-colors shadow-xl"
              >
                ENTER CATALOG
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full bg-neutral-900 overflow-hidden border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200"
              alt="Editorial ERD Campaign"
              className="w-full h-full object-cover filter contrast-[1.1]"
            />
          </div>
        </div>
      </section>

      {/* Minimal Editorial Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12 px-6 sm:px-10">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative h-5 w-28">
              <img src="/logo-black.png" alt="LENWINE" className="h-5 w-auto object-contain" />
            </div>
            <span>© 2026 ARCHIVE</span>
          </div>

          <div className="flex space-x-8">
            <Link href="/catalog" className="hover:text-black">ALL PRODUCTS</Link>
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-black">SEARCH</button>
          </div>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={allProducts}
        onSelectProduct={setSelectedProduct}
      />
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </main>
  );
}
