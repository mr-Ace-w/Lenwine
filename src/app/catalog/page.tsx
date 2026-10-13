'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import QuickViewModal from '@/components/QuickViewModal';
import CheckoutModal from '@/components/CheckoutModal';
import { ProductType, CLOTHING_TYPES } from '@/lib/products-data';
import { SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';

function CatalogContent() {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');
  const typeParam = searchParams.get('type');
  const availabilityParam = searchParams.get('availability');
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

  const matchesType = (p: ProductType, type: string) => {
    if (!type || type === 'all') return true;
    if (p.clothingType && p.clothingType.toLowerCase() === type.toLowerCase()) {
      return true;
    }
    const name = p.name.toLowerCase();
    switch (type.toLowerCase()) {
      case 'tshirts':
        return name.includes('tee') || name.includes('t-shirt') || name.includes('shirt') || name.includes('лонг') || name.includes('футболк');
      case 'sweaters':
        return name.includes('sweater') || name.includes('hoodie') || name.includes('hoddie') || name.includes('светр') || name.includes('худі') || name.includes('кофт');
      case 'jackets':
        return name.includes('jacket') || name.includes('coat') || name.includes('bomber') || name.includes('куртк') || name.includes('пуховик');
      case 'pants':
        return name.includes('jean') || name.includes('pant') || name.includes('trouser') || name.includes('джинс') || name.includes('штани');
      case 'shorts':
        return name.includes('short') || name.includes('шорт');
      case 'shoes':
        return name.includes('boot') || name.includes('shoe') || name.includes('sneaker') || name.includes('derby') || name.includes('взутт') || name.includes('черевик') || name.includes('кросівк');
      case 'headwear':
        return name.includes('cap') || name.includes('hat') || name.includes('beanie') || name.includes('кепк') || name.includes('шапк');
      case 'accessories':
        return name.includes('belt') || name.includes('bag') || name.includes('wallet') || name.includes('chain') || name.includes('ring') || name.includes('аксесуар');
      default:
        return true;
    }
  };

  const matchesBrand = (p: ProductType, brand: string) => {
    if (!brand) return true;
    const b = brand.toLowerCase();
    if (p.brand && p.brand.toLowerCase() === b) return true;
    return p.name.toLowerCase().includes(b);
  };

  const filteredProducts = products.filter(p => {
    // 1. Brand filter
    if (brandParam && !matchesBrand(p, brandParam)) {
      return false;
    }

    // 2. Clothing Type filter
    if (typeParam && !matchesType(p, typeParam)) {
      return false;
    }

    // 3. Availability filter
    const effectiveAvailability = availabilityParam || (activeCategory === 'IN_STOCK' ? 'IN_STOCK' : activeCategory === 'PREORDER' ? 'PREORDER' : null);
    if (effectiveAvailability === 'IN_STOCK') {
      if (p.inStock === false) return false;
    } else if (effectiveAvailability === 'PREORDER') {
      if (p.inStock !== false && p.category.toUpperCase() !== 'PREORDER' && p.category.toUpperCase() !== 'ПІД ЗАМОВЛЕННЯ') return false;
    }

    // 4. Legacy category filter
    if (!brandParam && !typeParam && !availabilityParam) {
      if (activeCategory === 'ALL') return true;
      if (activeCategory === 'IN_STOCK') return p.inStock !== false;
      if (activeCategory === 'PREORDER') {
        return p.inStock === false || p.category.toUpperCase() === 'PREORDER' || p.category.toUpperCase() === 'ПІД ЗАМОВЛЕННЯ';
      }
      if (activeCategory === 'BRANDS') return true;
      return p.category.toUpperCase() === activeCategory.toUpperCase();
    }

    return true;
  });

  const getCategoryTitle = () => {
    if (brandParam) {
      return `БРЕНДИ > ${brandParam.toUpperCase()}`;
    }

    const effectiveAvailability = availabilityParam || (activeCategory === 'IN_STOCK' ? 'IN_STOCK' : activeCategory === 'PREORDER' ? 'PREORDER' : null);
    let prefix = 'КОЛЕКЦІЯ';
    if (effectiveAvailability === 'IN_STOCK') {
      prefix = 'В НАЯВНОСТІ';
    } else if (effectiveAvailability === 'PREORDER') {
      prefix = 'ПІД ЗАМОВЛЕННЯ';
    } else if (!typeParam) {
      prefix = 'ВСІ ТОВАРИ';
    }

    if (typeParam && typeParam !== 'all') {
      const found = CLOTHING_TYPES.find(t => t.id === typeParam);
      const label = found ? found.label : typeParam.toUpperCase();
      return `${prefix} > ${label}`;
    }

    return prefix;
  };

  const hasActiveFilters = Boolean(brandParam || typeParam || availabilityParam || (activeCategory !== 'ALL' && activeCategory !== ''));

  return (
    <main className="min-h-screen bg-white text-black flex flex-col selection:bg-black selection:text-white pt-20 sm:pt-24">
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      {/* ERD Collection Section Header */}
      <section className="max-w-[1700px] mx-auto w-full px-4 sm:px-10 pt-6 sm:pt-10 pb-6 sm:pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-xl sm:text-3xl lg:text-4xl tracking-[0.08em] sm:tracking-[0.1em] text-black uppercase">
            {getCategoryTitle()}
          </h1>
          {hasActiveFilters && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400">
                Знайдено {filteredProducts.length} позицій
              </span>
              <span>•</span>
              <Link
                href="/catalog"
                className="text-[10px] font-mono uppercase font-bold text-neutral-600 hover:text-black flex items-center space-x-1 underline underline-offset-2"
              >
                <span>Скинути фільтри</span>
                <X className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="self-start sm:self-auto bg-black text-white px-5 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors flex items-center space-x-2 shadow-xs cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showFilters ? 'ЗАКРИТИ ФІЛЬТРИ' : 'ФІЛЬТРИ'}</span>
        </button>
      </section>

      {/* Filter Options Bar */}
      {showFilters && (
        <div className="max-w-[1700px] mx-auto w-full px-4 sm:px-10 pb-6 sm:pb-8 space-y-4 border-b border-neutral-200 animate-fade-in text-[11px] sm:text-xs font-bold tracking-[0.15em]">
          <div>
            <span className="block text-[10px] uppercase font-mono text-neutral-400 mb-2 font-bold">НАЯВНІСТЬ:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'ВСІ', val: 'ALL' },
                { label: 'В НАЯВНОСТІ', val: 'IN_STOCK' },
                { label: 'ПІД ЗАМОВЛЕННЯ', val: 'PREORDER' },
              ].map(cat => (
                <button
                  key={cat.val}
                  onClick={() => setActiveCategory(cat.val)}
                  className={`px-3.5 sm:px-4 py-2 border transition-colors cursor-pointer ${
                    activeCategory === cat.val
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-neutral-300 hover:border-black'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[10px] uppercase font-mono text-neutral-400 mb-2 font-bold">ТИП ОДЯГУ:</span>
            <div className="flex flex-wrap gap-2">
              {CLOTHING_TYPES.map(ct => (
                <Link
                  key={ct.id}
                  href={ct.id === 'all' ? '/catalog' : `/catalog?type=${ct.id}`}
                  className={`px-3 py-1.5 border text-[10px] uppercase transition-colors ${
                    typeParam === ct.id || (!typeParam && ct.id === 'all')
                      ? 'bg-black text-white border-black'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                >
                  {ct.label}
                </Link>
              ))}
            </div>
          </div>
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
