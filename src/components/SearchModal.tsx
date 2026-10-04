'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductType } from '@/lib/products-data';
import { Search, X } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductType[];
  onSelectProduct: (product: ProductType) => void;
}

export default function SearchModal({ isOpen, onClose, products, onSelectProduct }: SearchModalProps) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl text-white animate-fade-in">
      {/* Top Header Bar */}
      <div className="max-w-4xl mx-auto w-full px-6 pt-12 pb-6 flex items-center justify-between border-b border-white/10">
        <div className="flex-1 flex items-center space-x-4">
          <Search className="w-6 h-6 text-neutral-400 stroke-[1.5]" />
          <input
            type="text"
            autoFocus
            placeholder="ПОШУК ТОВАРІВ LENWINE..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-xl font-erd-heading tracking-[0.2em] outline-hidden uppercase placeholder-neutral-600 text-white"
          />
        </div>
        <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white">
          <X className="w-7 h-7 stroke-[1.5]" />
        </button>
      </div>

      {/* Results area */}
      <div className="max-w-4xl mx-auto w-full flex-1 overflow-y-auto px-6 py-8">
        {query.trim() === '' ? (
          <div className="space-y-6 text-center py-12">
            <p className="text-[10px] uppercase tracking-[0.35em] font-mono text-neutral-500">ПОПУЛЯРНІ КАТЕГОРІЇ</p>
            <div className="flex flex-wrap justify-center gap-3 text-xs uppercase font-mono font-bold">
              {['LEATHER', 'HOODIE', 'SILK', 'BOOTS', 'WOOL'].map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 border border-white/20 bg-neutral-900 hover:bg-white hover:text-black transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 font-mono uppercase tracking-[0.25em] text-xs">
            НІЧОГО НЕ ЗНАЙДЕНО ЗА ЗАПИТОМ &quot;{query}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="flex items-center space-x-4 p-3 bg-neutral-950 border border-white/10 hover:border-white transition-colors cursor-pointer"
              >
                <div className="relative w-16 h-20 bg-neutral-900 flex-shrink-0">
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-erd-heading text-xs uppercase text-white line-clamp-1">{product.name}</h4>
                  <p className="text-[9px] text-neutral-500 font-mono uppercase mt-0.5">{product.category}</p>
                  <p className="text-xs font-mono font-bold mt-1 text-white">{product.price.toLocaleString('uk-UA')} ₴</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
