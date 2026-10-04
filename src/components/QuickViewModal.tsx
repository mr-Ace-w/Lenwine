'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductType } from '@/lib/products-data';
import { useCart } from '@/context/CartContext';
import { X, Plus, Check, ShieldCheck } from 'lucide-react';

interface QuickViewModalProps {
  product: ProductType | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || 'M');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white shadow-2xl z-10 animate-fade-in overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-xs p-2 rounded-full text-black hover:bg-white"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Gallery */}
        <div className="w-full md:w-1/2 flex flex-col bg-neutral-100">
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex space-x-2 p-3 bg-white border-t border-neutral-100 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-14 h-16 flex-shrink-0 border-2 ${
                    activeImageIndex === idx ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <Image src={img} alt="Thumb" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Add to Cart */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.3em] font-semibold text-neutral-400 uppercase">
              LENWINE ARCHIVE • {product.category}
            </span>

            <h2 className="font-erd-heading text-2xl uppercase tracking-wider text-black">
              {product.name}
            </h2>

            <div className="flex items-center space-x-3 text-lg font-bold font-mono">
              <span>{product.price.toLocaleString('uk-UA')} ₴</span>
              {product.originalPrice && (
                <span className="text-sm font-normal text-neutral-400 line-through">
                  {product.originalPrice.toLocaleString('uk-UA')} ₴
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-sans border-t border-b border-neutral-100 py-4">
              {product.description}
            </p>

            {/* Sizes */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-2">
                ОБЕРІТЬ РОЗМІР:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs font-semibold uppercase border transition-colors ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-neutral-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleAdd}
              className="w-full bg-black text-white py-4 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center space-x-2 hover:bg-neutral-800 transition-colors shadow-md"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>ДОДАНО В КОШИК</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>ДОДАТИ В КОШИК</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-400 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ОРИГІНАЛЬНА ЯКІСТЬ LENWINE COUTURE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
