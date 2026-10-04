'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductType, OrderType } from '@/lib/products-data';
import {
  Shield,
  Plus,
  Package,
  ShoppingBag,
  TrendingUp,
  Trash2,
  ArrowLeft,
  RefreshCw,
  X,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [products, setProducts] = useState<ProductType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New product modal form state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'MEN',
    description: '',
    imagesText: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1000\nhttps://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&q=80&w=1000',
    sizes: 'S, M, L, XL',
    inStock: true,
    isFeatured: true
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resProd, resOrd] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ]);
      if (resProd.ok) {
        const prodData = await resProd.json();
        setProducts(prodData);
      }
      if (resOrd.ok) {
        const ordData = await resOrd.json();
        setOrders(ordData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedImagesList = newProduct.imagesText
        .split(/[\n,]+/)
        .map(url => url.trim())
        .filter(Boolean);

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
          images: parsedImagesList,
          sizes: newProduct.sizes.split(',').map(s => s.trim())
        })
      });
      if (res.ok) {
        setIsAddProductOpen(false);
        setNewProduct({
          name: '',
          price: '',
          originalPrice: '',
          category: 'MEN',
          description: '',
          imagesText: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1000\nhttps://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&q=80&w=1000',
          sizes: 'S, M, L, XL',
          inStock: true,
          isFeatured: true
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей товар з каталогу?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Preview parsed image URLs
  const previewImages = newProduct.imagesText
    .split(/[\n,]+/)
    .map(url => url.trim())
    .filter(Boolean);

  // Stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.2em] text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ПОВЕРНУТИСЯ ДО МАГАЗИНУ</span>
          </Link>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center space-x-3">
            <div className="relative h-6 w-32">
              <Image src="/logo-black.png" alt="LENWINE" fill className="object-contain object-left" />
            </div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-amber-700 font-mono">
              [ADMINISTRATION]
            </span>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="p-2 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 transition-colors flex items-center space-x-2 text-xs font-bold uppercase tracking-wider"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">ОНОВИТИ ДАНІ</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-neutral-200 mb-8 pb-px">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all border-b-2 ${
              activeTab === 'dashboard'
                ? 'border-black text-black font-extrabold bg-neutral-50'
                : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            ДАШБОРД
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all border-b-2 ${
              activeTab === 'products'
                ? 'border-black text-black font-extrabold bg-neutral-50'
                : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            ТОВАРИ ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all border-b-2 ${
              activeTab === 'orders'
                ? 'border-black text-black font-extrabold bg-neutral-50'
                : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            ЗАМОВЛЕННЯ ({orders.length})
          </button>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-neutral-50 border border-neutral-200 p-6 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-bold tracking-[0.2em] uppercase">
                  <span>ЗАГАЛЬНИЙ ДОХІД</span>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="mt-4 text-3xl font-mono font-bold text-black">
                  {totalRevenue.toLocaleString('uk-UA')} ₴
                </div>
                <div className="mt-2 text-[10px] text-neutral-400 font-mono uppercase tracking-[0.2em]">
                  З МОМЕНТУ ЗАПУСКУ МЕРЕЖІ
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 p-6 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-bold tracking-[0.2em] uppercase">
                  <span>ОФОРМЛЕНО ЗАМОВЛЕНЬ</span>
                  <ShoppingBag className="w-5 h-5 text-black" />
                </div>
                <div className="mt-4 text-3xl font-mono font-bold text-black">
                  {totalOrdersCount}
                </div>
                <div className="mt-2 text-[10px] text-neutral-400 font-mono uppercase tracking-[0.2em]">
                  АКТИВНІ ТА ВИКОНАНІ
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 p-6 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-bold tracking-[0.2em] uppercase">
                  <span>ПОЗИЦІЙ В КАТАЛОЗІ</span>
                  <Package className="w-5 h-5 text-black" />
                </div>
                <div className="mt-4 text-3xl font-mono font-bold text-black">
                  {totalProductsCount}
                </div>
                <div className="mt-2 text-[10px] text-neutral-400 font-mono uppercase tracking-[0.2em]">
                  В НАЯВНОСТІ В МАГАЗИНІ
                </div>
              </div>
            </div>

            {/* Recent Orders Overview Table */}
            <div className="bg-white border border-neutral-200 p-6 shadow-xs">
              <h3 className="font-extrabold text-sm tracking-[0.2em] uppercase text-black mb-4">
                ОСТАННІ ЗАМОВЛЕННЯ
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-200 text-neutral-500 uppercase tracking-[0.2em] text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">КЛІЄНТ</th>
                      <th className="py-3 px-4">СУМА</th>
                      <th className="py-3 px-4">СТАТУС</th>
                      <th className="py-3 px-4">ДАТА</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="hover:bg-neutral-50">
                        <td className="py-3 px-4 font-mono font-bold text-black">{order.id}</td>
                        <td className="py-3 px-4 font-bold">{order.customerName}</td>
                        <td className="py-3 px-4 font-mono font-bold">{order.totalAmount.toLocaleString('uk-UA')} ₴</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] uppercase ${
                              order.status === 'Shipped'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : order.status === 'Processing'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-500 text-[10px] font-mono">
                          {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base tracking-[0.2em] uppercase">УПРАВЛІННЯ КАТАЛОГОМ</h3>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="bg-black text-white px-5 py-3 text-xs font-bold tracking-[0.2em] uppercase flex items-center space-x-2 hover:bg-neutral-800 transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>ДОДАТИ НОВИЙ ТОВАР</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-neutral-200 overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 text-neutral-500 uppercase tracking-[0.2em] text-[10px] font-bold bg-neutral-50">
                  <tr>
                    <th className="py-3 px-4">ФОТО (КІЛЬКІСТЬ)</th>
                    <th className="py-3 px-4">НАЗВА</th>
                    <th className="py-3 px-4">КАТЕГОРІЯ</th>
                    <th className="py-3 px-4">ЦІНА</th>
                    <th className="py-3 px-4">РОЗМІРИ</th>
                    <th className="py-3 px-4 text-right">ДІЇ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="relative w-10 h-12 bg-neutral-100 border border-neutral-200 flex-shrink-0">
                            <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-1 border border-neutral-200">
                            {prod.images.length} фото
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-black">{prod.name}</td>
                      <td className="py-3 px-4 text-neutral-500 uppercase tracking-wider font-mono text-[11px]">{prod.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-black">
                        {prod.price.toLocaleString('uk-UA')} ₴
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">{prod.sizes.join(', ')}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-extrabold text-base tracking-[0.2em] uppercase">УПРАВЛІННЯ ЗАМОВЛЕННЯМИ</h3>

            <div className="space-y-4">
              {orders.map(ord => (
                <div key={ord.id} className="bg-white border border-neutral-200 p-6 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 gap-2">
                    <div>
                      <span className="font-mono text-black font-extrabold text-base mr-3">{ord.id}</span>
                      <span className="text-xs text-neutral-400 font-mono">
                        {new Date(ord.createdAt).toLocaleString('uk-UA')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-neutral-500 uppercase font-bold tracking-wider">СТАТУС:</span>
                      <select
                        value={ord.status}
                        onChange={e => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="bg-white border border-neutral-300 text-xs px-3 py-1.5 font-bold uppercase text-black focus:outline-hidden"
                      >
                        <option value="Pending">Pending (Очікує)</option>
                        <option value="Processing">Processing (Обробка)</option>
                        <option value="Shipped">Shipped (Відправлено)</option>
                        <option value="Delivered">Delivered (Доставлено)</option>
                        <option value="Cancelled">Cancelled (Скасовано)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mb-1">
                        ІНФОРМАЦІЯ ПРО КЛІЄНТА
                      </p>
                      <p className="font-bold text-black text-sm">{ord.customerName}</p>
                      <p className="text-neutral-600 font-mono">{ord.customerEmail} • {ord.customerPhone}</p>
                      <p className="text-neutral-800 mt-2 bg-neutral-50 p-2.5 border border-neutral-200 font-medium">
                        📍 {ord.shippingAddress}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mb-1">
                        ТОВАРИ В ЗАМОВЛЕННІ
                      </p>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-2 font-medium">
                        {ord.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs border-b border-neutral-100 pb-1">
                            <span>{item.name} ({item.size}) x{item.quantity}</span>
                            <span className="font-mono font-bold text-black">{(item.price * item.quantity).toLocaleString('uk-UA')} ₴</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm">
                        <span>ЗАГАЛОМ:</span>
                        <span className="font-mono font-extrabold text-black">{ord.totalAmount.toLocaleString('uk-UA')} ₴</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsAddProductOpen(false)} />
          <div className="relative w-full max-w-lg bg-white border border-neutral-300 p-6 sm:p-8 shadow-2xl z-10 animate-fade-in text-black max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <h3 className="font-bold text-base tracking-[0.2em] uppercase text-black">
                ДОДАТИ НОВИЙ ТОВАР
              </h3>
              <button onClick={() => setIsAddProductOpen(false)}>
                <X className="w-5 h-5 text-neutral-400 hover:text-black" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                  НАЗВА ТОВАРУ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="LENWINE VINTAGE HOODIE"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                    ЦІНА (₴) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="8500"
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                    КАТЕГОРІЯ *
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden uppercase font-bold"
                  >
                    <option value="MEN">MEN</option>
                    <option value="WOMEN">WOMEN</option>
                    <option value="ACCESSORIES">ACCESSORIES</option>
                    <option value="NEW">NEW</option>
                  </select>
                </div>
              </div>

              {/* Multiple Images URL Input */}
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                  ПОСИЛАННЯ НА ФОТОГРАФІЇ (МОЖНА ДОДАТИ КІЛЬКА ФОТО З НОВОГО РЯДКА АБО ЧЕРЕЗ КОМУ) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={`https://domain.com/photo1.jpg\nhttps://domain.com/photo2.jpg`}
                  value={newProduct.imagesText}
                  onChange={e => setNewProduct({ ...newProduct, imagesText: e.target.value })}
                  className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden font-mono text-[11px]"
                />

                {/* Live Photo Gallery Preview */}
                {previewImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-1 flex items-center space-x-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>ПОПЕРЕДНІЙ ПЕРЕГЛЯД ГАЛЕРЕЇ ({previewImages.length} ФОТО):</span>
                    </p>
                    <div className="flex space-x-2 overflow-x-auto pt-1">
                      {previewImages.map((imgUrl, i) => (
                        <div key={i} className="relative w-14 h-16 bg-neutral-100 border border-neutral-300 flex-shrink-0">
                          <img src={imgUrl} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                  РОЗМІРИ (ЧЕРЕЗ КОМУ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="S, M, L, XL"
                  value={newProduct.sizes}
                  onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value })}
                  className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                  ОПИС ТОВАРУ
                </label>
                <textarea
                  rows={2}
                  placeholder="Преміальний авторський дизайн LENWINE..."
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors shadow-md"
                >
                  ЗБЕРЕГТИ ТОВАР
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-6 py-3.5 bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-widest hover:text-black"
                >
                  СКАСУВАТИ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
