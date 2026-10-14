'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .catch(console.error);
  }, []);

  // Ensure video plays automatically across all browsers
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log('Video autoplay interaction catch:', err);
      });
    }
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black overflow-x-hidden">
      {/* Completely Transparent Floating Header overlaying Hero */}
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      {/* Pure Editorial Fullscreen Background Video Hero Section */}
      <section className="relative h-[100dvh] w-full flex items-end justify-start overflow-hidden bg-black">
        {/* Background Video Player */}
        <div className="absolute inset-0 z-0 bg-black">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover filter contrast-[1.08]"
          >
            <source src="https://pub-cfcb590cd8cc49a8acccc56630e96549.r2.dev/videos/hero.mp4?v=2" type="video/mp4" />
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          {/* Subtle gradient at top to smoothly blend with mobile status bar */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-black/25 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        </div>
      </section>

      {/* Editorial 'Shh...' Visual Section (Full-width, unconstrained aspect ratio) */}
      <section className="relative w-full bg-black flex items-center justify-center overflow-hidden py-4 sm:py-8 lg:py-16 select-none">
        <div className="relative w-full aspect-[1024/447]">
          <Image
            src="/shh.png"
            alt="Shh..."
            fill
            sizes="100vw"
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </section>

      {/* Understated, Subtle Editorial Footer */}
      <footer className="bg-black text-neutral-500 border-t border-white/[0.04] py-8 px-6 sm:px-12 mt-auto">
        <div className="max-w-[1750px] mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs tracking-[0.2em] uppercase text-neutral-500 gap-4 text-center sm:text-left">
            <div className="flex items-center space-x-4">
              <div className="relative h-4 w-24 opacity-40 hover:opacity-80 transition-opacity">
                <Image src="/logo-white.png" alt="LENWINE" fill className="object-contain object-center sm:object-left" />
              </div>
              <span className="font-mono text-[10px] text-neutral-600">© 2026</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] sm:text-[11px] font-mono tracking-[0.2em]">
              <Link href="/catalog" className="hover:text-neutral-300 transition-colors">КАТАЛОГ</Link>
              <button onClick={() => setIsSearchOpen(true)} className="hover:text-neutral-300 transition-colors cursor-pointer">ПОШУК</button>
              <a href="https://t.me/lenwine" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300 transition-colors">МЕНЕДЖЕР</a>
            </div>
          </div>

          <div className="border-t border-white/[0.03] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-mono tracking-[0.25em] text-neutral-600 uppercase text-center sm:text-left">
            <div>
              CREATED BY <span className="text-neutral-400">VUNNUTSKYY</span>
            </div>
            <div>
              PROJECT BY <span className="text-neutral-400">VUNNUTSKYY</span> &amp; <span className="text-neutral-400">MATHEW</span>
            </div>
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
