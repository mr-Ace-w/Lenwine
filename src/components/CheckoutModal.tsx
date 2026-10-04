'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { X, CheckCircle, Package } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, totalAmount, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const items = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      size: item.selectedSize,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images[0]
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: formData.address,
          totalAmount,
          items
        })
      });

      if (res.ok) {
        const order = await res.json();
        setCompletedOrder(order.id);
        clearCart();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white p-6 sm:p-8 shadow-2xl z-10 animate-fade-in border border-neutral-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black"
        >
          <X className="w-6 h-6 stroke-[1.5]" />
        </button>

        {completedOrder ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
            <h2 className="font-erd-logo text-2xl tracking-wider">ДЯКУЄМО ЗА ЗАМОВЛЕННЯ!</h2>
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              НОМЕР ЗАМОВЛЕННЯ: <span className="font-bold text-black font-mono">{completedOrder}</span>
            </p>
            <p className="text-xs text-neutral-600 max-w-xs mx-auto">
              Менеджер LENWINE зв&apos;яжеться з вами найближчим часом для підтвердження доставки.
            </p>
            <button
              onClick={() => {
                setCompletedOrder(null);
                onClose();
              }}
              className="mt-6 bg-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors"
            >
              ПОВЕРНУТИСЯ ДО МАГАЗИНУ
            </button>
          </div>
        ) : (
          <div>
            <div className="pb-6 border-b border-neutral-100 mb-6">
              <h2 className="font-erd-logo text-xl tracking-widest uppercase">ОФОРМЛЕННЯ ЗАМОВЛЕННЯ</h2>
              <p className="text-[11px] text-neutral-500 uppercase tracking-wider mt-1">
                ЗАГАЛОМ ДО СПЛАТИ: <span className="font-bold text-black">{totalAmount.toLocaleString('uk-UA')} ₴</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                  ПІБ ОДЕРЖУВАЧА *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Іван Іванов"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-neutral-300 p-2.5 text-xs focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-neutral-300 p-2.5 text-xs focus:outline-hidden focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                    ТЕЛЕФОН *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+380 67 000 0000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-neutral-300 p-2.5 text-xs focus:outline-hidden focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                  АДРЕСА ДОСТАВКИ / НОВА ПОШТА *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="м. Київ, Нова Пошта №1"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-neutral-300 p-2.5 text-xs focus:outline-hidden focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-4 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center space-x-2 hover:bg-neutral-800 transition-colors disabled:opacity-50 mt-6"
              >
                {isSubmitting ? (
                  <span>ОБРОБКА...</span>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    <span>ПІДТВЕРДИТИ ЗАМОВЛЕННЯ</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
