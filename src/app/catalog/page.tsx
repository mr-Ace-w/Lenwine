'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import QuickViewModal from '@/components/QuickViewModal';
import CheckoutModal from '@/components/CheckoutModal';
import { ProductType } from '@/lib/products-data';
import { SlidersHorizontal } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';

  const [products, setProducts] = useState<ProductType[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category') || 'ALL';
    setActiveCategory(cat);
  }, [searchParams]);

  const filteredProducts = products.filter(p => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'IN_STOCK') return p.inStock !== false;
    if (activeCategory === 'PREORDER') {
      return p.inStock === false || p.category.toUpperCase() === 'PREORDER' || p.category.toUpperCase() === 'ПІД ЗАМОВЛЕННЯ';
    }
    if (activeCategory === 'BRANDS') {
      const hasBrandsCat = products.some(prod => prod.category.toUpperCase() === 'BRANDS');
      return hasBrandsCat ? p.category.toUpperCase() === 'BRANDS' : true;
    }
    return p.category.toUpperCase() === activeCategory.toUpperCase();
  });

  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'MEN': return 'HOMME > NEW ARRIVALS';
      case 'WOMEN': return 'FEMME > NEW ARRIVALS';
      case 'ACCESSORIES': return 'ACCESSORIES > COLLECTION';
      case 'BRANDS': return 'COLLECTIONS > BRANDS';
      case 'PREORDER': return 'COLLECTIONS > ПІД ЗАМОВЛЕННЯ';
      case 'IN_STOCK': return 'COLLECTIONS > В НАЯВНОСТІ';
      default: return 'COLLECTIONS > ALL PRODUCTS';
    }
  };

  return (
    <main className="min-h-screen bg-white text-black flex flex-col selection:bg-black selection:text-white pt-20 sm:pt-24">
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      {/* ERD Collection Section Header (Screenshot Exact Layout) */}
      <section className="max-w-[1700px] mx-auto w-full px-4 sm:px-10 pt-6 sm:pt-10 pb-6 sm:pb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-extrabold text-xl sm:text-3xl lg:text-4xl tracking-[0.08em] sm:tracking-[0.1em] text-black uppercase">
          {getCategoryTitle()}
        </h1>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="self-start sm:self-auto bg-black text-white px-5 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors flex items-center space-x-2 shadow-xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>FILTERS</span>
        </button>
      </section>

      {/* Filter Options Bar */}
      {showFilters && (
        <div className="max-w-[1700px] mx-auto w-full px-4 sm:px-10 pb-6 sm:pb-8 flex flex-wrap gap-2.5 sm:gap-4 border-b border-neutral-200 animate-fade-in text-[11px] sm:text-xs font-bold tracking-[0.15em]">
          {[
            { label: 'ALL PRODUCTS', val: 'ALL' },
            { label: 'BRANDS', val: 'BRANDS' },
            { label: 'В НАЯВНОСТІ', val: 'IN_STOCK' },
            { label: 'ПІД ЗАМОВЛЕННЯ', val: 'PREORDER' },
            { label: 'HOMME (MEN)', val: 'MEN' },
            { label: 'FEMME (WOMEN)', val: 'WOMEN' },
          ].map(cat => (
            <button
              key={cat.val}
              onClick={() => setActiveCategory(cat.val)}
              className={`px-3.5 sm:px-4 py-2 border transition-colors ${
                activeCategory === cat.val
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-neutral-300 hover:border-black'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* ERD Product Grid */}
      <section className="max-w-[1700px] mx-auto w-full px-4 sm:px-10 pb-16 sm:pb-24 flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="bg-neutral-100 aspect-[3/4] w-full" />
                <div className="h-4 bg-neutral-100 w-2/3" />
                <div className="h-4 bg-neutral-100 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 font-mono">
            NO POSITIONS IN THIS COLLECTION
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-10 gap-y-10 sm:gap-y-16">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8 sm:py-10 px-4 sm:px-10">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-bold tracking-[0.18em] uppercase text-neutral-500 gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative h-5 w-28">
              <img src="/logo-black.png" alt="LENWINE" className="h-5 w-auto object-contain" />
            </div>
            <span>© 2026 ARCHIVE</span>
          </div>

          <div className="flex space-x-8">
            <button onClick={() => setActiveCategory('ALL')} className="hover:text-black">ALL PRODUCTS</button>
            <a href="/admin" className="hover:text-black text-black font-extrabold">ADMINISTRATION</a>
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-black">SEARCH</button>
          </div>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
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

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CatalogContent />
    </Suspense>
  );
}
