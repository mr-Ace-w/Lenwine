'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import QuickViewModal from '@/components/QuickViewModal';
import CheckoutModal from '@/components/CheckoutModal';
import { ProductType } from '@/lib/products-data';
import { useCart } from '@/context/CartContext';
import { Plus, Check, ArrowLeft, ShieldCheck, Truck, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProduct(data);
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    fetch('/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(console.error);
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addToCart(product, selectedSize);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleFastCheckout = () => {
    if (!product) return;
    addToCart(product, selectedSize);
    setIsCheckoutOpen(true);
  };

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const isSwipingHorizontal = useRef<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    isSwipingHorizontal.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Detect direction on first movement > 8px
    if (isSwipingHorizontal.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isSwipingHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isSwipingHorizontal.current === true) {
      touchDeltaX.current = diffX;
    }
  };

  const handleTouchEnd = () => {
    if (isSwipingHorizontal.current === true && product) {
      if (touchDeltaX.current < -35 && activeImageIndex < product.images.length - 1) {
        // Swiped left -> next photo
        setActiveImageIndex(prev => prev + 1);
      } else if (touchDeltaX.current > 35 && activeImageIndex > 0) {
        // Swiped right -> prev photo
        setActiveImageIndex(prev => prev - 1);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    touchDeltaX.current = 0;
    isSwipingHorizontal.current = null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black pt-28 flex items-center justify-center font-bold tracking-widest text-xs uppercase">
        LOADING ARCHIVE ITEM...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-black pt-28 px-6 text-center space-y-6">
        <h1 className="text-xl font-bold uppercase tracking-widest">PRODUCT NOT FOUND</h1>
        <Link href="/catalog" className="inline-block bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest">
          RETURN TO CATALOG
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black flex flex-col selection:bg-black selection:text-white pt-20 sm:pt-24">
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      {/* Back Button */}
      <div className="max-w-[1700px] mx-auto w-full px-4 sm:px-10 pt-4 sm:pt-6">
        <Link
          href="/catalog"
          className="inline-flex items-center space-x-2 text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO CATALOG</span>
        </Link>
      </div>

      {/* Main Product Layout */}
      <section className="max-w-[1700px] mx-auto w-full px-0 sm:px-10 py-3 sm:py-10 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-16">
        {/* Left: Gallery Column - Full width on mobile with smooth touch swipe */}
        <div className="flex flex-col space-y-3 sm:space-y-4 w-full">
          {/* Main Swipeable Carousel Container */}
          <div className="relative w-full overflow-hidden bg-white sm:border sm:border-neutral-200">
            {/* Smooth Animated Image Track with pan-y touch-action for unrestricted vertical scrolling */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                transform: `translateX(-${activeImageIndex * 100}%)`,
                transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
                touchAction: 'pan-y'
              }}
              className="flex w-full select-none"
            >
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className="w-full flex-shrink-0 relative aspect-[3/4] sm:aspect-[4/5] flex items-center justify-center bg-white"
                >
                  <Image
                    src={img}
                    alt={`${product.name} - ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
                    className="object-contain p-0 sm:p-4 pointer-events-none"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>

            {/* Floating Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeImageIndex === 0}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-black shadow-md border border-neutral-200 transition-opacity disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex(prev => Math.min(product.images.length - 1, prev + 1))}
                  disabled={activeImageIndex === product.images.length - 1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-black shadow-md border border-neutral-200 transition-opacity disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5 stroke-[1.8]" />
                </button>

                {/* Minimalist Counter Badge */}
                <div className="absolute bottom-3 right-3 bg-black/75 text-white font-mono text-[10px] font-bold px-2.5 py-1 tracking-widest backdrop-blur-xs shadow-xs pointer-events-none">
                  {activeImageIndex + 1} / {product.images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-2.5 sm:space-x-3 overflow-x-auto px-4 sm:px-0 pt-1 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-black opacity-100 shadow-xs'
                      : 'border-neutral-200 opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="Thumb" fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions Column (px-4 on mobile for nice margins) */}
        <div className="flex flex-col justify-between space-y-6 sm:space-y-8 px-4 sm:px-0">
          <div className="space-y-4 sm:space-y-6">
            <span className="text-[10px] font-mono tracking-[0.3em] font-extrabold text-neutral-400 uppercase">
              COLLECTION • {product.category}
            </span>

            <h1 className="font-erd-heading text-2xl sm:text-3xl lg:text-4xl uppercase tracking-[0.08em] sm:tracking-[0.1em] text-black leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center space-x-4 text-xl sm:text-2xl font-bold font-mono">
              <span>{product.price.toLocaleString('uk-UA')} ₴</span>
              {product.originalPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  {product.originalPrice.toLocaleString('uk-UA')} ₴
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-700 leading-relaxed font-sans border-t border-b border-neutral-200 py-4 sm:py-6">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold tracking-[0.2em] uppercase text-black">
                SELECT SIZE:
              </label>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold uppercase border transition-all ${
                      selectedSize === size
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-black border-neutral-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="space-y-3.5 sm:space-y-4 pt-4 sm:pt-6 border-t border-neutral-200">
            <button
              onClick={handleAdd}
              className="w-full bg-black text-white py-3.5 sm:py-4 text-xs font-extrabold tracking-[0.2em] sm:tracking-[0.25em] uppercase flex items-center justify-center space-x-2 hover:bg-neutral-800 transition-colors shadow-lg"
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>ADDED TO BAG ({selectedSize})</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>ADD TO BAG ({selectedSize})</span>
                </>
              )}
            </button>

            <button
              onClick={handleFastCheckout}
              className="w-full bg-neutral-100 border border-neutral-300 text-black py-3.5 sm:py-4 text-xs font-extrabold tracking-[0.2em] sm:tracking-[0.25em] uppercase hover:bg-black hover:text-white hover:border-black transition-all"
            >
              FAST CHECKOUT NOW
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] pt-3 sm:pt-4">
              <div className="flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-black" />
                <span>SHIPPING VIA NOVA POSHTA</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                <span>100% ORIGINAL GUARANTEE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8 sm:py-10 px-4 sm:px-10 mt-12 sm:mt-16">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-bold tracking-[0.18em] uppercase text-neutral-500 gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative h-5 w-28">
              <img src="/logo-black.png" alt="LENWINE" className="h-5 w-auto object-contain" />
            </div>
            <span>© 2026 ARCHIVE</span>
          </div>

          <div className="flex space-x-8">
            <Link href="/catalog" className="hover:text-black">ALL PRODUCTS</Link>
            <Link href="/admin" className="hover:text-black text-black font-extrabold">ADMINISTRATION</Link>
          </div>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={allProducts}
        onSelectProduct={() => {}}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </main>
  );
}
