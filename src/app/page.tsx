'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import QuickViewModal from '@/components/QuickViewModal';
import CheckoutModal from '@/components/CheckoutModal';
import { ProductType } from '@/lib/products-data';

import Image from 'next/image';

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

  const marqueeBrands = [
    'RICK OWENS',
    'BALENCIAGA',
    'MAISON MARGIELA',
    'ENFANTS RICHES DÉPRIMÉS',
    'UNDERCOVER',
    'NUMBER (N)INE',
    'HYSTERIC GLAMOUR',
    'VETEMENTS',
    'CHROME HEARTS',
    'SAINT LAURENT',
    'ACNE STUDIOS',
    'LGB',
    'KMRII',
    '14TH ADDICTION',
    'RAF SIMONS'
  ];

  const featuredProducts = allProducts.filter(p => p.isFeatured).length >= 4
    ? allProducts.filter(p => p.isFeatured).slice(0, 8)
    : allProducts.slice(0, 8);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black overflow-x-hidden">
      {/* Completely Transparent Floating Header overlaying Hero */}
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      {/* Pure Editorial Fullscreen Background Video Hero Section */}
      <section className="relative h-[100dvh] w-full flex items-end justify-center overflow-hidden bg-black">
        {/* Background Video Player */}
        <div className="absolute inset-0 z-0">
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

          {/* Deep Cinematic Gradients for contrast and zero status bar seam */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Hero Bottom Floating Editorial Billboard */}
        <div className="relative z-10 w-full max-w-[1750px] mx-auto px-4 sm:px-12 pb-10 sm:pb-16 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-300 border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>COLLECTION • 2026 ARCHIVE</span>
          </div>

          <h1 className="font-erd-heading text-3xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-[0.08em] sm:tracking-[0.14em] text-white leading-tight drop-shadow-2xl">
            EXCLUSIVE COUTURE
          </h1>

          <p className="text-xs sm:text-sm font-sans tracking-[0.15em] uppercase text-neutral-300 max-w-lg drop-shadow-md">
            Archive luxury pieces from Paris, Tokyo &amp; Antwerp. Individual pre-orders &amp; in-stock archive.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            <Link
              href="/catalog"
              className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 active:scale-95 transition-all text-xs font-black tracking-[0.22em] uppercase px-8 sm:px-10 py-4 shadow-2xl flex items-center justify-center space-x-2 text-center"
            >
              <span>ВІДКРИТИ КАТАЛОГ ({allProducts.length || '629'})</span>
              <span className="text-base leading-none font-bold">→</span>
            </Link>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Link
                href="/catalog?availability=IN_STOCK"
                className="flex-1 sm:flex-none bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/25 active:scale-95 transition-all text-[10px] sm:text-xs font-bold tracking-[0.18em] uppercase px-5 py-4 text-center"
              >
                В НАЯВНОСТІ
              </Link>
              <Link
                href="/catalog?availability=PREORDER"
                className="flex-1 sm:flex-none bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/25 active:scale-95 transition-all text-[10px] sm:text-xs font-bold tracking-[0.18em] uppercase px-5 py-4 text-center"
              >
                ПІД ЗАМОВЛЕННЯ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Marquee Ribbon */}
      <section className="bg-black border-y border-neutral-900 py-3.5 overflow-hidden select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center space-x-8 text-[11px] sm:text-xs font-mono font-bold tracking-[0.3em] uppercase text-neutral-400">
          {[...marqueeBrands, ...marqueeBrands].map((b, i) => (
            <span key={i} className="flex items-center space-x-8">
              <span className="hover:text-white transition-colors cursor-default">{b}</span>
              <span className="text-neutral-700 font-normal">•</span>
            </span>
          ))}
        </div>
      </section>

      {/* Featured Editorial Picks */}
      {featuredProducts.length > 0 && (
        <section className="bg-black py-12 sm:py-20 px-4 sm:px-12 max-w-[1750px] mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3 border-b border-neutral-900 pb-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 block mb-1">
                EDITORIAL SELECTION
              </span>
              <h2 className="font-extrabold text-xl sm:text-3xl uppercase tracking-[0.1em] text-white">
                НОВІ НАДХОДЖЕННЯ
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-white transition-colors flex items-center space-x-1"
            >
              <span>ДИВИТИСЬ ВСІ ({allProducts.length})</span>
              <span>→</span>
            </Link>
          </div>

          {/* 2-Column on Mobile, 4-Column on Desktop Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {featuredProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group flex flex-col bg-neutral-950 border border-neutral-900 hover:border-neutral-700 transition-all p-2.5 sm:p-3"
              >
                <div className="relative aspect-[3/4] w-full bg-white flex items-center justify-center overflow-hidden mb-3">
                  <Image
                    src={p.images[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1000'}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {p.inStock && (
                    <span className="absolute top-2 left-2 bg-black text-white text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5">
                      IN STOCK
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {p.brand && (
                    <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.18em] uppercase text-neutral-400 font-bold truncate">
                      {p.brand}
                    </p>
                  )}
                  <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.08em] text-white truncate group-hover:text-neutral-300 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-mono font-bold text-neutral-200 pt-0.5">
                    {p.price.toLocaleString('uk-UA')} ₴
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <Link
              href="/catalog"
              className="inline-block w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 hover:border-neutral-600 px-10 py-4 text-xs font-black tracking-[0.25em] uppercase transition-all shadow-md text-center"
            >
              ВІДКРИТИ ПОВНИЙ КАТАЛОГ ({allProducts.length} ПОЗИЦІЙ) →
            </Link>
          </div>
        </section>
      )}

      {/* Minimal Editorial Black Footer */}
      <footer className="bg-black text-white border-t border-neutral-900 py-12 px-6 sm:px-12 mt-auto">
        <div className="max-w-[1750px] mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative h-7 w-44">
                <Image src="/logo-white.png" alt="LENWINE" fill className="object-contain object-center sm:object-left" />
              </div>
              <span className="font-mono text-[11px] text-neutral-500">© 2026 ARCHIVE</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <Link href="/catalog" className="hover:text-white transition-colors">ALL PRODUCTS</Link>
              <button onClick={() => setIsSearchOpen(true)} className="hover:text-white transition-colors cursor-pointer">SEARCH</button>
              <a href="https://t.me/lenwine" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">MANAGER</a>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase text-center sm:text-left">
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
