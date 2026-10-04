'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import QuickViewModal from '@/components/QuickViewModal';
import CheckoutModal from '@/components/CheckoutModal';
import { ProductType } from '@/lib/products-data';
import { ArrowDown } from 'lucide-react';

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(console.error);
  }, []);

  return (
    <main className="min-h-screen bg-white text-black flex flex-col selection:bg-black selection:text-white">
      {/* Completely Transparent Floating Header overlaying Hero */}
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      {/* Pure Editorial Fullscreen Background Video Hero Section */}
      <section className="relative h-screen w-full flex items-end justify-start overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          {/* Background Video Player */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter contrast-[1.08]"
          >
            <source src="/hero.mp4" type="video/mp4" />
            {/* Fallback image if video is loading or missing */}
            <img
              src="/hero-blue.jpg"
              alt="LENWINE Campaign"
              className="w-full h-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />
        </div>

        {/* Hero Overlay Content */}
        <div className="relative z-10 max-w-[1700px] mx-auto w-full px-6 sm:px-12 pb-16 space-y-6 text-white">
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-neutral-300 font-bold">
              AUTUMN / WINTER 2026 ARCHIVE
            </span>
            <h1 className="font-erd-logo text-4xl sm:text-7xl lg:text-8xl tracking-[0.2em] uppercase text-white leading-none">
              LENWINE
            </h1>
            <p className="max-w-md text-xs sm:text-sm text-neutral-300 tracking-[0.2em] font-mono uppercase leading-relaxed">
              ENFANTS RICHES DÉPRIMÉS ESTHÉTIQUE • DISTRESSED LEATHER • PUNK COUTURE
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-6">
            <Link
              href="/catalog"
              className="bg-white text-black px-8 py-4 text-xs font-extrabold tracking-[0.25em] uppercase hover:bg-neutral-200 transition-all flex items-center space-x-2 shadow-2xl"
            >
              <span>DISCOVER ALL PRODUCTS</span>
              <ArrowDown className="w-4 h-4" />
            </Link>

            <Link
              href="/catalog?category=MEN"
              className="bg-black/60 backdrop-blur-md border border-white/30 text-white px-8 py-4 text-xs font-extrabold tracking-[0.25em] uppercase hover:bg-white hover:text-black transition-all"
            >
              SELECT COLLECTION
            </Link>
          </div>
        </div>
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
