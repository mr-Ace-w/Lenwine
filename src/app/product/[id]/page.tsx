'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import QuickViewModal from '@/components/QuickViewModal';
import CheckoutModal from '@/components/CheckoutModal';
import { ProductType } from '@/lib/products-data';
import { useCart } from '@/context/CartContext';
import { Plus, Check, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';

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
    <main className="min-h-screen bg-white text-black flex flex-col selection:bg-black selection:text-white pt-24">
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      {/* Back Button */}
      <div className="max-w-[1700px] mx-auto w-full px-6 sm:px-10 pt-6">
        <Link
          href="/catalog"
          className="inline-flex items-center space-x-2 text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO CATALOG</span>
        </Link>
      </div>

      {/* Main Product Layout */}
      <section className="max-w-[1700px] mx-auto w-full px-6 sm:px-10 py-10 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
        {/* Left: Gallery Column */}
        <div className="flex flex-col space-y-4">
          <div className="relative aspect-[3/4] w-full bg-neutral-100 border border-neutral-200 shadow-xs">
            <Image
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pt-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-24 flex-shrink-0 border-2 transition-all ${
                    activeImageIndex === idx ? 'border-black opacity-100' : 'border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="Thumb" fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions Column */}
        <div className="flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <span className="text-[10px] font-mono tracking-[0.3em] font-extrabold text-neutral-400 uppercase">
              COLLECTION • {product.category}
            </span>

            <h1 className="font-erd-heading text-3xl sm:text-4xl uppercase tracking-[0.1em] text-black leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center space-x-4 text-2xl font-bold font-mono">
              <span>{product.price.toLocaleString('uk-UA')} ₴</span>
              {product.originalPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  {product.originalPrice.toLocaleString('uk-UA')} ₴
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-700 leading-relaxed font-sans border-t border-b border-neutral-200 py-6">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold tracking-[0.2em] uppercase text-black">
                SELECT SIZE:
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2.5 text-xs font-bold uppercase border transition-all ${
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
          <div className="space-y-4 pt-6 border-t border-neutral-200">
            <button
              onClick={handleAdd}
              className="w-full bg-black text-white py-4 text-xs font-extrabold tracking-[0.25em] uppercase flex items-center justify-center space-x-2 hover:bg-neutral-800 transition-colors shadow-lg"
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
              className="w-full bg-neutral-100 border border-neutral-300 text-black py-4 text-xs font-extrabold tracking-[0.25em] uppercase hover:bg-black hover:text-white hover:border-black transition-all"
            >
              FAST CHECKOUT NOW
            </button>

            <div className="flex items-center justify-center space-x-6 text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] pt-4">
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
      <footer className="bg-white border-t border-neutral-200 py-10 px-6 sm:px-10 mt-16">
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
