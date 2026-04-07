'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import Link from 'next/link';

const SPICE = ['', '🌶', '🌶🌶', '🌶🌶🌶'];

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('table');

  const { restaurant, table, categories, fetchByQR, fetchCategories, loading, error } = useRestaurantStore();
  const { addToCart, getItemCount, getTotal, setContext } = useCartStore();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'veg' | 'featured'>('all');
  const [addedId, setAddedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!code) { router.push('/'); return; }
    fetchByQR(code);
  }, [code]);

  useEffect(() => {
    if (restaurant && table) { fetchCategories(restaurant.id); setContext(table.id, restaurant.id); }
  }, [restaurant?.id, table?.id]);

  useEffect(() => {
    if (categories.length && !activeCategory) setActiveCategory(categories[0].id);
  }, [categories]);

  const handleAdd = (item: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    addToCart({ id: item.id, name: item.name, basePrice: item.basePrice, image: item.image, isVegetarian: item.isVegetarian });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    categoryRefs.current[catId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const allItems = categories.flatMap((c) => c.items.map((i: any) => ({ ...i, categoryName: c.name })));
  const searchResults = search ? allItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase())) : null;
  const displayCategories = filter === 'veg'
    ? categories.map((c) => ({ ...c, items: c.items.filter((i: any) => i.isVegetarian) })).filter((c) => c.items.length)
    : filter === 'featured'
    ? categories.map((c) => ({ ...c, items: c.items.filter((i: any) => i.isFeatured) })).filter((c) => c.items.length)
    : categories;

  if (loading) return (
    <div className="min-h-screen hero-bg flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-orange-200" />
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-stone-500 text-sm">Loading menu...</p>
      </div>
    </div>
  );

  if (error || !restaurant) return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-6">
      <div className="card p-8 max-w-sm w-full text-center shadow-lg">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-stone-600 mb-5">{error || 'Restaurant not found'}</p>
        <button onClick={() => router.push('/')} className="btn-primary w-full">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fff8f3] pb-32">
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 border-b border-orange-100 shadow-sm shadow-orange-50">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          {/* Restaurant info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {restaurant.logo
                ? <img src={restaurant.logo} alt="" className="w-11 h-11 rounded-2xl object-cover ring-2 ring-orange-100" />
                : <div className="w-11 h-11 rounded-2xl gradient-orange flex items-center justify-center text-2xl shadow-md shadow-orange-200">🍽️</div>
              }
              <div>
                <h1 className="font-black text-stone-900 text-lg leading-tight">{restaurant.name}</h1>
                <p className="text-stone-400 text-xs">Table {table?.tableNumber} · <span className="capitalize">{table?.section}</span></p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${restaurant.isOpen ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${restaurant.isOpen ? 'bg-green-500 pulse-dot' : 'bg-red-500'}`} />
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dishes..."
              className="w-full bg-orange-50 border border-orange-100 rounded-2xl pl-10 pr-4 py-2.5 text-stone-700 text-sm placeholder-stone-300 focus:outline-none focus:border-orange-400 focus:bg-white transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500">✕</button>}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 mb-3">
            {(['all', 'veg', 'featured'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`pill ${filter === f ? 'pill-active' : 'pill-inactive'}`}>
                {f === 'all' ? 'All' : f === 'veg' ? '🥦 Veg' : '⭐ Featured'}
              </button>
            ))}
          </div>

          {/* Category tabs */}
          {!search && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {displayCategories.map((cat) => (
                <button key={cat.id} onClick={() => scrollToCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat.id ? 'pill-active' : 'pill-inactive'}`}>
                  {cat.icon && <span>{cat.icon}</span>}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu items */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {search && searchResults ? (
          searchResults.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-stone-400">No dishes found for "{search}"</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-stone-400 text-sm">{searchResults.length} results</p>
              {searchResults.map((item: any) => <ItemCard key={item.id} item={item} currency={restaurant.currency} onAdd={handleAdd} addedId={addedId} onTap={setSelectedItem} />)}
            </div>
          )
        ) : (
          displayCategories.map((cat) => (
            <div key={cat.id} ref={(el) => { categoryRefs.current[cat.id] = el; }} className="mb-8">
              <div className="flex items-center gap-3 mb-4 pt-2">
                {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                <h2 className="text-lg font-black text-stone-900">{cat.name}</h2>
                <div className="flex-1 h-px bg-orange-100" />
                <span className="text-stone-300 text-xs font-semibold">{cat.items.length}</span>
              </div>
              <div className="space-y-3">
                {cat.items.map((item: any) => <ItemCard key={item.id} item={item} currency={restaurant.currency} onAdd={handleAdd} addedId={addedId} onTap={setSelectedItem} />)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart FAB */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-30 max-w-2xl mx-auto">
          <Link href="/cart">
            <div className="btn-primary flex items-center justify-between px-5 py-4 rounded-2xl shadow-2xl shadow-orange-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/25 rounded-xl flex items-center justify-center font-black text-white text-sm">{getItemCount()}</div>
                <span className="text-white font-bold text-base">View Cart</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-lg">{restaurant.currency} {getTotal().toFixed(0)}</span>
                <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Waiter bell */}
      <div className="fixed bottom-24 right-4 z-30">
        <Link href="/waiter">
          <div className="w-14 h-14 bg-white border-2 border-orange-200 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-100 hover:border-orange-400 transition-all active:scale-90">
            🔔
          </div>
        </Link>
      </div>

      {/* Item detail modal */}
      {selectedItem && (
        <ItemModal item={selectedItem} currency={restaurant.currency} onClose={() => setSelectedItem(null)}
          onAdd={(item: any) => { handleAdd(item); setSelectedItem(null); }} addedId={addedId} />
      )}
    </div>
  );
}

function ItemCard({ item, currency, onAdd, addedId, onTap }: any) {
  const isAdded = addedId === item.id;
  return (
    <div className="item-card cursor-pointer" onClick={() => onTap(item)}>
      <div className="flex gap-0">
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={item.isVegetarian ? 'veg-dot' : 'non-veg-dot'} />
            {item.isFeatured && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-semibold border border-amber-200">⭐ Chef's Pick</span>}
          </div>
          <h3 className="font-bold text-stone-900 text-sm leading-tight mb-1">{item.name}</h3>
          {item.description && <p className="text-stone-400 text-xs leading-relaxed line-clamp-2 mb-2">{item.description}</p>}
          <div className="flex items-center gap-2 mb-3">
            {item.spiceLevel > 0 && <span className="text-xs">{SPICE[item.spiceLevel]}</span>}
            {item.calories && <span className="text-stone-300 text-xs">{item.calories} cal</span>}
            <span className="text-stone-300 text-xs">~{item.preparationTime}m</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-black text-orange-500 text-base">{currency} {item.basePrice}</span>
            <button onClick={(e) => { e.stopPropagation(); onAdd(item, e); }} disabled={!item.isAvailable}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-90 ${
                !item.isAvailable ? 'bg-stone-100 text-stone-300 cursor-not-allowed' :
                isAdded ? 'bg-green-50 text-green-600 border border-green-200' :
                'bg-orange-500 text-white shadow-md shadow-orange-200 hover:bg-orange-600'
              }`}>
              {isAdded ? '✓ Added' : !item.isAvailable ? 'Sold Out' : '+ Add'}
            </button>
          </div>
        </div>
        {item.image && (
          <div className="w-28 flex-shrink-0 relative">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}

function ItemModal({ item, currency, onClose, onAdd, addedId }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl overflow-hidden slide-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {item.image && <img src={item.image} alt={item.name} className="w-full h-52 object-cover" />}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={item.isVegetarian ? 'veg-dot' : 'non-veg-dot'} />
                {item.isFeatured && <span className="text-xs text-amber-600 font-semibold">⭐ Chef's Pick</span>}
              </div>
              <h2 className="text-xl font-black text-stone-900">{item.name}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 ml-3 hover:bg-stone-200">✕</button>
          </div>
          {item.description && <p className="text-stone-500 text-sm leading-relaxed mb-4">{item.description}</p>}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {item.spiceLevel > 0 && <span className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold">{SPICE[item.spiceLevel]} Spicy</span>}
            {item.calories && <span className="bg-stone-50 border border-stone-200 text-stone-500 px-3 py-1 rounded-full text-xs font-semibold">{item.calories} cal</span>}
            <span className="bg-stone-50 border border-stone-200 text-stone-500 px-3 py-1 rounded-full text-xs font-semibold">~{item.preparationTime} min</span>
            {item.isVegetarian && <span className="bg-green-50 border border-green-200 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">🥦 Vegetarian</span>}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-orange-500">{currency} {item.basePrice}</span>
            <button onClick={() => onAdd(item)} disabled={!item.isAvailable}
              className={`px-8 py-3 rounded-2xl font-bold text-base transition-all active:scale-95 ${
                !item.isAvailable ? 'bg-stone-100 text-stone-300' :
                addedId === item.id ? 'bg-green-500 text-white' :
                'btn-primary'
              }`}>
              {!item.isAvailable ? 'Sold Out' : addedId === item.id ? '✓ Added!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen hero-bg flex items-center justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <MenuContent />
    </Suspense>
  );
}
