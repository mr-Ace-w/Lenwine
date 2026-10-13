'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
      .then(data => setAllProducts(data))
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
    <main className="min-h-screen bg-white text-black flex flex-col selection:bg-black selection:text-white">
      {/* Completely Transparent Floating Header overlaying Hero */}
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      {/* Pure Editorial Fullscreen Background Video Hero Section */}
      <section className="relative h-screen w-full flex items-end justify-start overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          {/* Background Video Player */}
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
          <div className="absolute inset-0 bg-black/15" />
        </div>
      </section>


      {/* Minimal Editorial Black Footer */}
      <footer className="bg-black text-white border-t border-neutral-900 py-12 px-6 sm:px-10">
        <div className="max-w-[1700px] mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative h-6 w-32">
                <img src="/logo-white.png" alt="LENWINE" className="h-6 w-auto object-contain" />
              </div>
              <span className="font-mono text-[11px] text-neutral-500">© 2026 ARCHIVE</span>
            </div>

            <div className="flex space-x-8">
              <Link href="/catalog" className="hover:text-white transition-colors">ALL PRODUCTS</Link>
              <button onClick={() => setIsSearchOpen(true)} className="hover:text-white transition-colors">SEARCH</button>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase">
            <div>
              CREATED BY <span className="text-white font-bold">VUNNUTSKYY</span>
            </div>
            <div>
              PROJECT BY <span className="text-white font-bold">VUNNUTSKYY</span> &amp; <span className="text-white font-bold">MATHEW</span>
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
