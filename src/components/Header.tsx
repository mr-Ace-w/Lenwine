'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  onSearchClick?: () => void;
}

export default function Header({ onSearchClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();

  // Determine theme color based on page route: White on Homepage (/), Black on other pages
  const isHomePage = pathname === '/';
  const logoSrc = isHomePage ? '/logo-white.png' : '/logo-black.png';
  const textColor = isHomePage ? 'text-white' : 'text-black';

  const menuItems = [
    { label: 'ALL PRODUCTS', href: '/catalog' },
    { label: 'COLLECTIONS', href: '/catalog?category=MEN' },
    { label: 'ARCHIVE', href: '/catalog?category=ALL' },
    { label: 'STORES / LOCATIONS', href: '/catalog' },
  ];

  return (
    <>
      {/* Fixed Sticky Header - Completely Transparent Floating over content */}
      <header className={`fixed top-0 left-0 right-0 z-40 bg-transparent ${textColor} pt-6 sm:pt-8 pb-4 pointer-events-none`}>
        <div className="max-w-[1750px] mx-auto px-6 sm:px-12 flex items-center justify-between pointer-events-auto">
          {/* Left: Far-Left LENWINE Logo Image (White on homepage, Black on other pages) */}
          <div>
            <Link href="/" className="group flex items-center">
              <div className="relative h-8 sm:h-10 w-44 sm:w-60 group-hover:opacity-75 transition-opacity">
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
          <div className={`flex items-center space-x-6 sm:space-x-8 ${textColor}`}>
            {/* Search Icon */}
            <button
              onClick={onSearchClick}
              aria-label="Search"
              className="p-1 hover:opacity-70 transition-opacity"
            >
              <Search className="w-6 h-6 stroke-[1.8]" />
            </button>

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart"
              className="relative p-1 hover:opacity-70 transition-opacity flex items-center space-x-1"
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
              {totalCount > 0 && (
                <span className="font-mono text-xs font-bold">({totalCount})</span>
              )}
            </button>

            {/* Burger Menu Trigger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Menu"
              className="p-1 hover:opacity-70 transition-opacity flex items-center justify-center"
            >
              <Menu className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.8]" />
            </button>
          </div>
        </div>
      </header>

      {/* Sleek Slide-out Navigation Drawer (Burger Menu) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Drawer Content */}
          <div className="relative w-full max-w-sm bg-white text-black h-full p-8 sm:p-12 flex flex-col justify-between z-10 animate-fade-in shadow-2xl">
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-8 border-b border-neutral-200">
                <div className="relative h-7 w-36">
                  <Image src="/logo-black.png" alt="LENWINE" fill className="object-contain object-left" />
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-neutral-400 hover:text-black transition-colors"
                >
                  <X className="w-7 h-7 stroke-[1.8]" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="mt-10 space-y-8">
                {menuItems.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-left font-bold text-xl sm:text-2xl tracking-[0.18em] uppercase text-neutral-900 hover:text-black hover:pl-2 transition-all duration-200 border-b border-neutral-100 pb-4"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Drawer Bottom Info */}
            <div className="border-t border-neutral-200 pt-8 space-y-4">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onSearchClick) onSearchClick();
                }}
                className="flex items-center space-x-3 w-full p-4 bg-neutral-100 font-bold text-xs uppercase tracking-[0.2em]"
              >
                <Search className="w-4 h-4" />
                <span>SEARCH CATALOG</span>
              </button>

              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 text-center pt-2">
                © LENWINE HIGH FASHION COUTURE
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
