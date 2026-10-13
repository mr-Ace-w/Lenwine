'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductType, OrderType } from '@/lib/products-data';
import { uploadImageToSupabase } from '@/lib/supabase';
import {
  Plus,
  Package,
  ShoppingBag,
  TrendingUp,
  Trash2,
  ArrowLeft,
  RefreshCw,
  X,
  Upload,
  Image as ImageIcon,
  Lock,
  LogOut,
  KeyRound,
  ChevronUp,
  ChevronDown,
  Pencil
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [products, setProducts] = useState<ProductType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Product modal form state (Create / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'MEN',
    description: '',
    images: [] as string[],
    sizes: 'S, M, L, XL',
    inStock: true,
    isFeatured: true
  });

  // Check auth session on load
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('lenwine_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('lenwine_admin_auth', 'true');
        setIsAuthenticated(true);
        setPasswordInput('');
      } else {
        setAuthError(data.error || 'Невірний пароль!');
      }
    } catch (err) {
      setAuthError('Помилка сервера при вході');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('lenwine_admin_auth');
    setIsAuthenticated(false);
  };

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
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      originalPrice: '',
      category: 'MEN',
      description: '',
      images: [],
      sizes: 'S, M, L, XL',
      inStock: true,
      isFeatured: true
    });
    setUrlInput('');
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (prod: ProductType) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      price: String(prod.price),
      originalPrice: prod.originalPrice ? String(prod.originalPrice) : '',
      category: prod.category,
      description: prod.description || '',
      images: [...prod.images],
      sizes: prod.sizes.join(', '),
      inStock: prod.inStock !== false,
      isFeatured: Boolean(prod.isFeatured)
    });
    setUrlInput('');
    setIsProductModalOpen(true);
  };

  const handleMoveProduct = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const temp = newProducts[index];
    newProducts[index] = newProducts[targetIndex];
    newProducts[targetIndex] = temp;

    // Optimistic UI update
    setProducts(newProducts);

    try {
      await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newProducts.map(p => p.id) })
      });
    } catch (err) {
      console.error('Error reordering products:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Try uploading to Cloudflare R2 via /api/upload
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            uploadedUrls.push(data.url);
            continue;
          }
        }
      } catch (err) {
        console.error('R2 upload failed, trying fallback:', err);
      }

      // Fallback: Supabase Storage
      const fallbackUrl = await uploadImageToSupabase(file);
      if (fallbackUrl) {
        uploadedUrls.push(fallbackUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } else {
      alert('Переконайся, що у файлі .env.local заповнено ключі Cloudflare R2 або Supabase!');
    }
    setIsUploading(false);
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleReorderImage = (fromIndex: number, toIndex: number) => {
    setProductForm(prev => {
      const imgs = [...prev.images];
      const [moved] = imgs.splice(fromIndex, 1);
      imgs.splice(toIndex, 0, moved);
      return { ...prev, images: imgs };
    });
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, trimmed]
    }));
    setUrlInput('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: productForm.name,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        category: productForm.category,
        description: productForm.description,
        images: productForm.images.length > 0 ? productForm.images : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1000'],
        sizes: productForm.sizes.split(',').map(s => s.trim()).filter(Boolean),
        inStock: productForm.inStock,
        isFeatured: productForm.isFeatured
      };

      if (editingProduct) {
        // EDIT existing
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert('Помилка при оновленні товару: ' + (err.error || 'Спробуйте ще раз'));
          return;
        }
      } else {
        // CREATE new
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert('Помилка при створенні товару: ' + (err.error || 'Спробуйте ще раз'));
          return;
        }
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Помилка сервера при збереженні товару');
    } finally {
      setIsSaving(false);
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


  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;

  // LOGIN SCREEN FOR UNAUTHENTICATED USERS
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
        <div className="w-full max-w-sm space-y-8 text-center animate-fade-in">
          {/* Logo & Header */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-44 h-12">
              <Image src="/logo-white.png" alt="LENWINE" fill className="object-contain" priority />
            </div>
            <div className="flex items-center space-x-2 text-neutral-400 font-mono text-xs uppercase tracking-[0.3em]">
              <Lock className="w-3.5 h-3.5 text-neutral-500" />
              <span>[ADMIN SYSTEM ACCESS]</span>
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 mb-2">
                ВВЕДІТЬ ПАРОЛЬ АДМІНІСТРАТОРА
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-white text-white p-3.5 pl-10 text-sm outline-hidden transition-colors font-mono"
                />
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-4" />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-400 text-xs font-mono uppercase tracking-wider text-center">
                ⚠️ {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-white text-black py-3.5 text-xs font-extrabold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {isAuthenticating ? 'АВТОРИЗАЦІЯ...' : 'УВІЙТИ В СИСТЕМУ'}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-900">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-xs font-mono text-neutral-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ПОВЕРНУТИСЯ ДО МАГАЗИНУ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN DASHBOARD WHEN AUTHENTICATED
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3 sm:space-x-6">
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">МАГАЗИН</span>
          </Link>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative h-5 sm:h-6 w-24 sm:w-32">
              <Image src="/logo-black.png" alt="LENWINE" fill className="object-contain object-left" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-amber-700 font-mono">
              [ADMIN]
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={fetchData}
            aria-label="Оновити дані"
            className="p-2 sm:px-3 sm:py-2 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 transition-colors flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">ОНОВИТИ</span>
          </button>

          <button
            onClick={handleLogout}
            aria-label="Вихід"
            className="p-2 sm:px-3 sm:py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ВИХІД</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 sm:space-x-4 border-b border-neutral-200 mb-6 sm:mb-8 pb-px overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all border-b-2 flex-shrink-0 ${
              activeTab === 'dashboard'
                ? 'border-black text-black font-extrabold bg-neutral-50'
                : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            ДАШБОРД
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all border-b-2 flex-shrink-0 ${
              activeTab === 'products'
                ? 'border-black text-black font-extrabold bg-neutral-50'
                : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            ТОВАРИ ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all border-b-2 flex-shrink-0 ${
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <h3 className="font-extrabold text-sm sm:text-base tracking-[0.2em] uppercase">УПРАВЛІННЯ КАТАЛОГОМ</h3>
              <button
                onClick={handleOpenCreate}
                className="bg-black text-white px-5 py-3 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center space-x-2 hover:bg-neutral-800 transition-colors shadow-md text-center"
              >
                <Plus className="w-4 h-4" />
                <span>ДОДАТИ НОВИЙ ТОВАР</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-neutral-200 overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead className="border-b border-neutral-200 text-neutral-500 uppercase tracking-[0.2em] text-[10px] font-bold bg-neutral-50">
                  <tr>
                    <th className="py-3 px-4 w-16 text-center">ПОРЯДОК</th>
                    <th className="py-3 px-4">ФОТО</th>
                    <th className="py-3 px-4">НАЗВА</th>
                    <th className="py-3 px-4">КАТЕГОРІЯ</th>
                    <th className="py-3 px-4">НАЯВНІСТЬ</th>
                    <th className="py-3 px-4">ЦІНА</th>
                    <th className="py-3 px-4">РОЗМІРИ</th>
                    <th className="py-3 px-4 text-right">ДІЇ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map((prod, index) => (
                    <tr key={prod.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleMoveProduct(index, 'up')}
                            disabled={index === 0}
                            title="Підняти вище в каталозі"
                            className="p-1.5 bg-neutral-100 hover:bg-black hover:text-white text-neutral-700 border border-neutral-200 disabled:opacity-20 disabled:hover:bg-neutral-100 disabled:hover:text-neutral-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveProduct(index, 'down')}
                            disabled={index === products.length - 1}
                            title="Опустити нижче в каталозі"
                            className="p-1.5 bg-neutral-100 hover:bg-black hover:text-white text-neutral-700 border border-neutral-200 disabled:opacity-20 disabled:hover:bg-neutral-100 disabled:hover:text-neutral-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="relative w-10 h-12 bg-neutral-100 border border-neutral-200 flex-shrink-0">
                            {prod.images && prod.images[0] ? (
                              <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-neutral-400">НЕМАЄ</div>
                            )}
                          </div>
                          <span className="text-[10px] font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-1 border border-neutral-200">
                            {prod.images?.length || 0} фото
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-black">{prod.name}</td>
                      <td className="py-3 px-4 text-neutral-500 uppercase tracking-wider font-mono text-[11px]">{prod.category}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase font-mono ${
                          prod.inStock !== false ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {prod.inStock !== false ? 'В НАЯВНОСТІ' : 'ПІД ЗАМОВЛЕННЯ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-black">
                        {prod.price.toLocaleString('uk-UA')} ₴
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">{prod.sizes?.join(', ')}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            title="Редагувати товар"
                            className="p-1.5 bg-neutral-100 hover:bg-black hover:text-white text-neutral-700 border border-neutral-200 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            title="Видалити товар"
                            className="p-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 border border-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white border border-neutral-300 p-5 sm:p-8 shadow-2xl z-10 animate-fade-in text-black max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base tracking-[0.2em] uppercase text-black">
                  {editingProduct ? 'РЕДАГУВАТИ ТОВАР' : 'ДОДАТИ НОВИЙ ТОВАР'}
                </h3>
                {editingProduct && (
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">ID: {editingProduct.id}</p>
                )}
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                aria-label="Закрити"
                className="p-1 hover:bg-neutral-100 rounded-sm transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400 hover:text-black" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                  НАЗВА ТОВАРУ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="LENWINE VINTAGE HOODIE"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                    ЦІНА (₴) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="8500"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                    СТАРА ЦІНА (ОПЦІЙНО)
                  </label>
                  <input
                    type="number"
                    placeholder="9900"
                    value={productForm.originalPrice}
                    onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                    КАТЕГОРІЯ *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden uppercase font-bold"
                  >
                    <option value="MEN">HOMME (MEN)</option>
                    <option value="WOMEN">FEMME (WOMEN)</option>
                    <option value="BRANDS">BRANDS</option>
                    <option value="ACCESSORIES">ACCESSORIES</option>
                    <option value="NEW">NEW ARRIVALS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                    НАЯВНІСТЬ *
                  </label>
                  <select
                    value={productForm.inStock ? 'true' : 'false'}
                    onChange={e => setProductForm({ ...productForm, inStock: e.target.value === 'true' })}
                    className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden uppercase font-bold"
                  >
                    <option value="true">В НАЯВНОСТІ</option>
                    <option value="false">ПІД ЗАМОВЛЕННЯ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                    РОЗМІРИ (ЧЕРЕЗ КОМУ) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="S, M, L, XL"
                    value={productForm.sizes}
                    onChange={e => setProductForm({ ...productForm, sizes: e.target.value })}
                    className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Direct Gallery Upload & Visual Reorder Section */}
              <div className="border border-neutral-200 p-4 bg-neutral-50/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-[11px] uppercase text-black font-extrabold tracking-wider">
                      ФОТОГРАФІЇ ТОВАРУ ({productForm.images.length}) *
                    </label>
                    <p className="text-[10px] text-neutral-500 font-medium">
                      Перше фото є головною обкладинкою. Стрілками ◀ / ▶ можна змінювати порядок фото.
                    </p>
                  </div>

                  {/* Device / Gallery Direct Upload Button */}
                  <label className={`cursor-pointer inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-black text-white hover:bg-neutral-800 transition-colors font-bold text-xs uppercase tracking-wider shadow-xs ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'ЗАВАНТАЖЕННЯ...' : '+ ЗАВАНТАЖИТИ З ГАЛЕРЕЇ'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Direct URL input fallback */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="url"
                    placeholder="Або вставте посилання на фото (URL)"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUrl();
                      }
                    }}
                    className="flex-1 bg-white border border-neutral-300 px-3 py-2 text-xs font-mono outline-hidden focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-black font-bold text-xs uppercase transition-colors"
                  >
                    ДОДАТИ
                  </button>
                </div>

                {/* Visual Image Grid with Reorder and Delete Controls */}
                {productForm.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {productForm.images.map((imgUrl, i) => (
                      <div
                        key={i}
                        className={`relative group border ${i === 0 ? 'border-black ring-2 ring-black/20' : 'border-neutral-300'} bg-white p-1`}
                      >
                        <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                          <img src={imgUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                          {i === 0 && (
                            <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase font-mono shadow-xs">
                              ГОЛОВНЕ
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            title="Видалити фото"
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 shadow-md transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-1.5 px-0.5 text-[10px] font-mono text-neutral-600">
                          <span className="font-bold">#{i + 1}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleReorderImage(i, i - 1)}
                              disabled={i === 0}
                              className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-20 text-neutral-800 border border-neutral-200 transition-colors"
                              title="Пересунути лівіше"
                            >
                              ◀
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReorderImage(i, i + 1)}
                              disabled={i === productForm.images.length - 1}
                              className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-20 text-neutral-800 border border-neutral-200 transition-colors"
                              title="Пересунути правіше"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-neutral-300 bg-white">
                    <ImageIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-xs text-neutral-600 font-bold uppercase tracking-wider">Немає фотографій</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Натисніть "+ ЗАВАНТАЖИТИ З ГАЛЕРЕЇ", щоб додати фото з вашого телефону або ПК</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">
                  ОПИС ТОВАРУ
                </label>
                <textarea
                  rows={3}
                  placeholder="Преміальний авторський дизайн LENWINE..."
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-white border border-neutral-300 p-2.5 focus:border-black outline-hidden"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-black text-white py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors shadow-md disabled:opacity-50 text-center cursor-pointer"
                >
                  {isSaving ? 'ЗБЕРЕЖЕННЯ...' : editingProduct ? 'ОНОВИТИ ТОВАР' : 'ЗБЕРЕГТИ ТОВАР'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-6 py-3.5 bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-widest transition-colors text-center cursor-pointer"
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
