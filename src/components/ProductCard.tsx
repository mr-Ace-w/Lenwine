'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductType } from '@/lib/products-data';
import { useCart } from '@/context/CartContext';
import { Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: ProductType;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [isHovered, setIsHovered] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const { addToCart } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1800);
  };

  const currentImage = isHovered && product.images[1] ? product.images[1] : product.images[0];

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative flex flex-col bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-white flex items-center justify-center p-2">
        <Image
          src={currentImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-102"
        />

        {/* Minimal Size Selector Bar on Hover */}
        <div className="absolute bottom-2 left-2 right-2 p-2 bg-white/95 backdrop-blur-xs border border-neutral-200 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col space-y-1.5 shadow-md">
          <div className="flex items-center justify-center space-x-1">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`text-[9px] font-bold px-2 py-0.5 transition-colors ${
                  selectedSize === size
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 text-black hover:bg-neutral-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-black text-white py-1.5 text-[9px] font-bold tracking-[0.2em] uppercase flex items-center justify-center space-x-1 hover:bg-neutral-800 transition-colors"
          >
            {addedSuccess ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>ДОДАНО В КОШИК</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>ADD TO BAG ({selectedSize})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Title & Price below image */}
      <div className="mt-4 flex flex-col space-y-1 text-left">
        <h3 className="font-bold text-[11px] tracking-[0.15em] text-black uppercase line-clamp-1 group-hover:opacity-60 transition-opacity">
          {product.name}
        </h3>

        <div className="flex items-center space-x-2 text-[11px] font-bold tracking-[0.1em] text-neutral-900">
          <span>{product.price.toLocaleString('uk-UA')} ₴</span>
          {product.originalPrice && (
            <span className="text-neutral-400 line-through text-[10px]">
              {product.originalPrice.toLocaleString('uk-UA')} ₴
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
