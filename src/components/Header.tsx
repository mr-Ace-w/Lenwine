'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, ShoppingBag, ChevronLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CLOTHING_TYPES } from '@/lib/products-data';

interface HeaderProps {
  onSearchClick?: () => void;
}

export default function Header({ onSearchClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'subcategories' | 'brands'>('main');
  const [subcategoryScope, setSubcategoryScope] = useState<{
    title: string;
    scope: 'ALL' | 'PREORDER' | 'IN_STOCK';
  }>({ title: 'ВСІ ТОВАРИ', scope: 'ALL' });
  const [brandSearch, setBrandSearch] = useState('');
  const [allBrands, setAllBrands] = useState<string[]>([]);

  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();

  // Determine theme color based on page route: White on Homepage (/), Black on other pages
  const isHomePage = pathname === '/';
  const logoSrc = isHomePage ? '/logo-white.png' : '/logo-black.png';
  const textColor = isHomePage ? 'text-white' : 'text-black';

  // Fetch only active brands present on the site
  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllBrands(data);
        }
      })
      .catch(() => {});
  }, []);

  // Handle drawer open / scroll lock / dynamic brands refresh
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      fetch('/api/brands')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAllBrands(data);
          }
        })
        .catch(() => {});
    } else {
      document.body.style.overflow = '';
      // Reset view after transition
      const timer = setTimeout(() => {
        setMenuView('main');
        setBrandSearch('');
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const filteredBrands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    if (!q) return allBrands;
    return allBrands.filter(b => b.toLowerCase().includes(q));
  }, [allBrands, brandSearch]);

  return (
    <>
      {/* Fixed Sticky Header - Completely Transparent Floating over content */}
      <header className={`fixed top-0 left-0 right-0 z-40 bg-transparent ${textColor} pt-[max(1rem,env(safe-area-inset-top))] sm:pt-8 pb-3 sm:pb-4 pointer-events-none`}>
        <div className="max-w-[1750px] mx-auto px-4 sm:px-12 flex items-center justify-between pointer-events-auto">
          {/* Left: Far-Left LENWINE Logo Image (White on homepage, Black on other pages) */}
          <div>
            <Link href="/" className="group flex items-center">
              <div className="relative h-7 sm:h-10 w-44 sm:w-60 group-hover:opacity-75 transition-opacity">
                <Image
                  src={logoSrc}
                  alt="LENWINE"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Right: Icons (Search, Cart, Burger Menu) */}
          <div className={`flex items-center space-x-3.5 sm:space-x-8 ${textColor}`}>
            {/* Search Icon */}
            <button
              onClick={onSearchClick}
              aria-label="Search"
              className="p-1 hover:opacity-70 transition-opacity cursor-pointer"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
            </button>

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart"
              className="relative p-1 hover:opacity-70 transition-opacity flex items-center space-x-1 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              {totalCount > 0 && (
                <span className="font-mono text-[11px] sm:text-xs font-bold">({totalCount})</span>
              )}
            </button>

            {/* Burger Menu Trigger */}
            <button
              onClick={() => {
                setMenuView('main');
                setIsMenuOpen(true);
              }}
              aria-label="Open Menu"
              className="p-1 hover:opacity-70 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <Menu className="w-6 h-6 sm:w-8 sm:h-8 stroke-[1.8]" />
            </button>
          </div>
        </div>
      </header>

      {/* Smooth Animated Navigation Drawer (Burger Menu - НАЙСИЛЬНІШИЙ blur) */}
      <div className={`fixed inset-0 z-50 transition-visibility duration-300 ${isMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 ease-in-out ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`glass-panel-ultra fixed top-0 right-0 bottom-0 w-full max-w-[360px] sm:max-w-md text-white h-full flex flex-col justify-between transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 sm:px-10 pt-6 sm:pt-8 pb-4 border-b border-white/[0.06]">
            {menuView === 'main' ? (
              <div className="relative h-6 sm:h-7 w-32 sm:w-36">
                <Image src="/logo-white.png" alt="LENWINE" fill className="object-contain object-left" />
              </div>
            ) : menuView === 'subcategories' ? (
              <button
                onClick={() => setMenuView('main')}
                className="flex items-center space-x-2 text-base sm:text-lg font-black tracking-[0.04em] uppercase text-white hover:text-neutral-400 transition-colors cursor-pointer -ml-1"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                <span>{subcategoryScope.title}</span>
              </button>
            ) : (
              <button
                onClick={() => setMenuView('main')}
                className="flex items-center space-x-2 text-base sm:text-lg font-black tracking-[0.04em] uppercase text-white hover:text-neutral-400 transition-colors cursor-pointer -ml-1"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                <span>БРЕНДИ</span>
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Закрити меню"
            >
              <X className="w-6 h-6 stroke-[1.8]" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 sm:py-8">
            {/* VIEW 1: MAIN MENU (Screenshot 1) */}
            {menuView === 'main' && (
              <div className="space-y-6 sm:space-y-7 animate-fade-in">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-xl sm:text-2xl font-black tracking-[0.04em] uppercase text-white hover:text-neutral-400 transition-colors"
                >
                  ГОЛОВНА
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubcategoryScope({ title: 'ВСІ ТОВАРИ', scope: 'ALL' });
                    setMenuView('subcategories');
                  }}
                  className="block text-left w-full text-xl sm:text-2xl font-black tracking-[0.04em] uppercase text-white hover:text-neutral-400 transition-colors cursor-pointer"
                >
                  ВСІ ТОВАРИ
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubcategoryScope({ title: 'ПІД ЗАМОВЛЕННЯ', scope: 'PREORDER' });
                    setMenuView('subcategories');
                  }}
                  className="block text-left w-full text-xl sm:text-2xl font-black tracking-[0.04em] uppercase text-white hover:text-neutral-400 transition-colors cursor-pointer"
                >
                  ПІД ЗАМОВЛЕННЯ
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubcategoryScope({ title: 'В НАЯВНОСТІ', scope: 'IN_STOCK' });
                    setMenuView('subcategories');
                  }}
                  className="block text-left w-full text-xl sm:text-2xl font-black tracking-[0.04em] uppercase text-white hover:text-neutral-400 transition-colors cursor-pointer"
                >
                  В НАЯВНОСТІ
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBrandSearch('');
                    setMenuView('brands');
                  }}
                  className="block text-left w-full text-xl sm:text-2xl font-black tracking-[0.04em] uppercase text-white hover:text-neutral-400 transition-colors cursor-pointer"
                >
                  БРЕНДИ
                </button>

                <a
                  href="https://t.me/flockawerty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xl sm:text-2xl font-black tracking-[0.04em] uppercase text-white hover:text-neutral-400 transition-colors"
                >
                  МЕНЕДЖЕР
                </a>
              </div>
            )}

            {/* VIEW 2: SUBCATEGORIES (Screenshot 2) */}
            {menuView === 'subcategories' && (
              <div className="space-y-5 sm:space-y-6 animate-fade-in">
                {CLOTHING_TYPES.map(cat => {
                  const href =
                    cat.id === 'all'
                      ? subcategoryScope.scope === 'ALL'
                        ? '/catalog'
                        : `/catalog?availability=${subcategoryScope.scope}`
                      : `/catalog?type=${cat.id}${
                          subcategoryScope.scope !== 'ALL' ? `&availability=${subcategoryScope.scope}` : ''
                        }`;

                  return (
                    <Link
                      key={cat.id}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-lg sm:text-xl font-extrabold tracking-[0.04em] uppercase text-white hover:text-neutral-400 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* VIEW 3: BRANDS WITH REALTIME SEARCH (Screenshot 3) */}
            {menuView === 'brands' && (
              <div className="space-y-4 animate-fade-in flex flex-col h-full">
                {/* Search Bar matching screenshot */}
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Пошук бренду..."
                    value={brandSearch}
                    onChange={e => setBrandSearch(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-md pl-10 pr-8 py-2.5 text-xs sm:text-sm font-medium text-white placeholder-neutral-400 outline-hidden focus:border-white/30 focus:bg-white/15 transition-colors"
                    autoFocus
                  />
                  {brandSearch && (
                    <button
                      onClick={() => setBrandSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Alphabetical list with dividers */}
                <div className="divide-y divide-white/[0.06] flex-1 overflow-y-auto pr-1">
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map(brand => (
                      <Link
                        key={brand}
                        href={`/catalog?brand=${encodeURIComponent(brand)}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-3.5 text-xs sm:text-sm font-bold tracking-[0.08em] uppercase text-white hover:text-neutral-400 hover:pl-1 transition-all"
                      >
                        {brand}
                      </Link>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs font-mono text-neutral-500 uppercase">
                      {brandSearch
                        ? `Бренд "${brandSearch}" не знайдено`
                        : 'На сайті ще немає доданих брендів'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Bottom Info */}
          <div className="border-t border-white/[0.06] px-6 sm:px-10 py-5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              <span>LENWINE ARCHIVE</span>
              <span>© 2026</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
