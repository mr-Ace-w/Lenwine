'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export default function CartDrawer({ onOpenCheckout }: CartDrawerProps) {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalAmount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-black text-white border-l border-white/15 h-full shadow-2xl flex flex-col justify-between z-10 animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h2 className="font-erd-logo text-base tracking-[0.2em] uppercase">КОШИК ({cart.length})</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 text-neutral-400 hover:text-white transition-opacity"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-white/10">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <ShoppingBag className="w-12 h-12 text-neutral-700 mx-auto stroke-[1]" />
              <p className="text-xs uppercase tracking-[0.3em] font-mono text-neutral-500">
                КОШИК ПОРОЖНІЙ
              </p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.product.id}-${item.selectedSize}-${idx}`} className="pt-6 first:pt-0 flex space-x-4">
                {/* Image */}
                <div className="relative w-20 h-28 bg-neutral-900 border border-white/10 flex-shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-erd-heading text-xs uppercase tracking-wider text-white line-clamp-2">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>

                    <div className="mt-1 text-[10px] text-neutral-400 font-mono">
                      РОЗМІР: <span className="font-bold text-white">{item.selectedSize}</span>
                    </div>

                    <div className="mt-1 text-xs font-mono font-bold text-white">
                      {item.product.price.toLocaleString('uk-UA')} ₴
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center space-x-3 mt-3">
                    <div className="flex items-center border border-white/20 bg-neutral-900">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, -1)}
                        className="px-2 py-1 hover:bg-neutral-800 text-neutral-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-mono font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, 1)}
                        className="px-2 py-1 hover:bg-neutral-800 text-neutral-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-neutral-950 space-y-4">
            <div className="flex items-center justify-between text-sm font-mono">
              <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-medium">
                СУМА:
              </span>
              <span className="font-bold text-base">
                {totalAmount.toLocaleString('uk-UA')} ₴
              </span>
            </div>

            <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-mono text-center">
              БЕЗКОШТОВНА ЕКСПРЕС-ДОСТАВКА ВІД 5000 ₴
            </p>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onOpenCheckout();
              }}
              className="w-full bg-white text-black py-4 text-xs font-bold tracking-[0.25em] uppercase flex items-center justify-center space-x-2 hover:bg-neutral-200 transition-colors shadow-xl"
            >
              <span>ОФОРМИТИ ЗАМОВЛЕННЯ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
