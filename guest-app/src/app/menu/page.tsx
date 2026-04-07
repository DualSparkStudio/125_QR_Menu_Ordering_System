'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { api } from '@/lib/api';
import Link from 'next/link';

const SPICE_ICONS = ['', '🌶️', '🌶️🌶️', '🌶️🌶️🌶️'];

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qrCode = searchParams.get('table');

  const { restaurant, table, categories, fetchByQR, fetchCategories, loading, error } = useRestaurantStore();
  const { addToCart, getItemCount, getTotal, setContext } = useCartStore();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'veg' | 'featured'>('all');
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!qrCode) { router.push('/'); return; }
    fetchByQR(qrCode);
  }, [qrCode]);

  useEffect(() => {
    if (restaurant && table) {
      fetchCategories(restaurant.id);
      setContext(table.id, restaurant.id);
    }
  }, [restaurant, table]);

  useEffect(() => {
    if (categories.length && !activeCategory) setActiveCategory(categories[0].id);
  }, [categories]);

  const handleAdd = (item: any) => {
    addToCart({ id: item.id, name: item.name, basePrice: item.basePrice, image: item.image, isVegetarian: item.isVegetarian });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1000);
  };

  const allItems = categories.flatMap((c) => c.items.map((i) => ({ ...i, categoryName: c.name })));
  const filteredItems = allItems.filter((item) => {
    if (filter === 'veg' && !item.isVegetarian) return false;
    if (filter === 'featured' && !item.isFeatured) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const displayItems = search || filter !== 'all'
    ? filteredItems
    : (categories.find((c) => c.id === activeCategory)?.items || []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !restaurant) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-gray-600">{error || 'Restaurant not found'}</p>
        <button onClick={() => router.push('/')} className="btn-primary mt-4">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {restaurant.logo && <img src={restaurant.logo} alt={restaurant.name} className="w-10 h-10 rounded-full object-cover" />}
              <div>
                <h1 className="font-bold text-gray-900 text-lg leading-tight">{restaurant.name}</h1>
                <p className="text-xs text-gray-500">Table {table?.tableNumber} · {table?.section}</p>
              </div>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full font-medium ${restaurant.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-3">
            {(['all', 'veg', 'featured'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {f === 'all' ? 'All' : f === 'veg' ? '🥦 Veg' : '⭐ Featured'}
              </button>
            ))}
          </div>

          {/* Category tabs */}
          {!search && filter === 'all' && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-3">
        {displayItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">🍽️</div>
            <p>No items found</p>
          </div>
        ) : (
          displayItems.map((item: any) => (
            <div key={item.id} className="card p-4 flex gap-4">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={item.isVegetarian ? 'veg-dot' : 'non-veg-dot'} />
                      {item.isFeatured && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">⭐ Chef's pick</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                    {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {item.spiceLevel > 0 && <span className="text-xs">{SPICE_ICONS[item.spiceLevel]}</span>}
                      {item.calories && <span className="text-xs text-gray-400">{item.calories} cal</span>}
                      <span className="text-xs text-gray-400">~{item.preparationTime}min</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-gray-900">{restaurant.currency} {item.basePrice.toFixed(2)}</span>
                  <button
                    onClick={() => handleAdd(item)}
                    disabled={!item.isAvailable}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                      !item.isAvailable ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                      addedId === item.id ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {!item.isAvailable ? 'Unavailable' : addedId === item.id ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart FAB */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-30">
          <Link href="/cart" className="max-w-2xl mx-auto flex items-center justify-between bg-orange-500 text-white rounded-2xl px-5 py-4 shadow-lg hover:bg-orange-600 transition-all">
            <div className="flex items-center gap-3">
              <span className="bg-white text-orange-500 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">{getItemCount()}</span>
              <span className="font-semibold">View Cart</span>
            </div>
            <span className="font-bold">{restaurant.currency} {getTotal().toFixed(2)}</span>
          </Link>
        </div>
      )}

      {/* Waiter call button */}
      <div className="fixed bottom-24 right-4 z-30">
        <Link href="/waiter" className="bg-white border border-gray-200 shadow-md rounded-full w-14 h-14 flex items-center justify-center text-2xl hover:bg-gray-50 transition-all">
          🔔
        </Link>
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>}>
      <MenuContent />
    </Suspense>
  );
}
