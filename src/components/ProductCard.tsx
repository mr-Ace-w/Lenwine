'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductType } from '@/lib/products-data';

interface ProductCardProps {
  product: ProductType;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const currentImage =
    (isHovered && product.images?.[1]) ||
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1000';

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
