'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

export default function MenuPage() {
  const { staff, token } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '' });
  const [itemForm, setItemForm] = useState({ categoryId: '', name: '', description: '', basePrice: '', isVegetarian: false, isVegan: false, isFeatured: false, preparationTime: '15', spiceLevel: '0', calories: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!staff?.restaurantId || !token) return;
    const data: any = await adminApi.getCategories(staff.restaurantId, token);
    setCategories(data);
    if (!activeCategory && data.length) setActiveCategory(data[0].id);
    setLoading(false);
  };

  useEffect(() => { load(); }, [staff, token]);

  const saveCategory = async () => {
    if (!staff?.restaurantId || !token || !catForm.name) return;
    setSaving(true);
    try {
      await adminApi.createCategory(staff.restaurantId, catForm, token);
      setCatForm({ name: '', description: '', icon: '' });
      setShowCatForm(false);
      await load();
    } finally { setSaving(false); }
  };

  const deleteCategory = async (id: string) => {
    if (!staff?.restaurantId || !token || !confirm('Delete this category and all its items?')) return;
    await adminApi.deleteCategory(staff.restaurantId, id, token);
    await load();
  };

  const saveItem = async () => {
    if (!staff?.restaurantId || !token || !itemForm.name || !itemForm.basePrice) return;
    setSaving(true);
    try {
      const data = { ...itemForm, basePrice: parseFloat(itemForm.basePrice), spiceLevel: parseInt(itemForm.spiceLevel), preparationTime: parseInt(itemForm.preparationTime), calories: itemForm.calories ? parseInt(itemForm.calories) : undefined, categoryId: itemForm.categoryId || activeCategory };
      if (editItem) {
        await adminApi.updateMenuItem(staff.restaurantId, editItem.id, data, token);
      } else {
        await adminApi.createMenuItem(staff.restaurantId, data, token);
      }
      setItemForm({ categoryId: '', name: '', description: '', basePrice: '', isVegetarian: false, isVegan: false, isFeatured: false, preparationTime: '15', spiceLevel: '0', calories: '' });
      setShowItemForm(false);
      setEditItem(null);
      await load();
    } finally { setSaving(false); }
  };

  const toggleAvailability = async (id: string) => {
    if (!staff?.restaurantId || !token) return;
    await adminApi.toggleItemAvailability(staff.restaurantId, id, token);
    await load();
  };

  const deleteItem = async (id: string) => {
    if (!staff?.restaurantId || !token || !confirm('Delete this item?')) return;
    await adminApi.deleteMenuItem(staff.restaurantId, id, token);
    await load();
  };

  const startEditItem = (item: any) => {
    setEditItem(item);
    setItemForm({ categoryId: item.categoryId, name: item.name, description: item.description || '', basePrice: item.basePrice.toString(), isVegetarian: item.isVegetarian, isVegan: item.isVegan, isFeatured: item.isFeatured, preparationTime: item.preparationTime.toString(), spiceLevel: item.spiceLevel.toString(), calories: item.calories?.toString() || '' });
    setShowItemForm(true);
  };

  const activeItems = categories.find((c) => c.id === activeCategory)?.items || [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowCatForm(true)} className="bg-white border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 text-sm">+ Category</button>
            <button onClick={() => { setEditItem(null); setShowItemForm(true); }} className="bg-orange-500 text-white font-medium px-4 py-2 rounded-xl hover:bg-orange-600 text-sm">+ Add Item</button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Categories sidebar */}
          <div className="w-48 flex-shrink-0">
            <div className="space-y-1">
              {categories.map((cat) => (
                <div key={cat.id} className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeCategory === cat.id ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-100 text-gray-600'}`} onClick={() => setActiveCategory(cat.id)}>
                  <span className="text-sm font-medium truncate">{cat.icon && `${cat.icon} `}{cat.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} className="text-gray-300 hover:text-red-400 text-xs ml-1">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="flex-1">
            {loading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}</div>
            ) : activeItems.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-2">🍽️</div>
                <p>No items in this category</p>
                <button onClick={() => setShowItemForm(true)} className="mt-3 text-orange-500 text-sm font-medium">Add first item →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeItems.map((item: any) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
                    {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 ${item.isVegetarian ? 'border-green-600 bg-green-500' : 'border-red-600 bg-red-500'}`} />
                        <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                        {item.isFeatured && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">⭐ Featured</span>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">₹{item.basePrice}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleAvailability(item.id)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${item.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                      <button onClick={() => startEditItem(item)} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium">Edit</button>
                      <button onClick={() => deleteItem(item.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-medium">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category form modal */}
        {showCatForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="font-bold text-lg text-gray-900 mb-4">New Category</h2>
              <div className="space-y-3">
                <input value={catForm.name} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))} placeholder="Category name *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <input value={catForm.description} onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <input value={catForm.icon} onChange={(e) => setCatForm((f) => ({ ...f, icon: e.target.value }))} placeholder="Icon emoji (e.g. 🍕)" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowCatForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={saveCategory} disabled={saving} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Item form modal */}
        {showItemForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl my-4">
              <h2 className="font-bold text-lg text-gray-900 mb-4">{editItem ? 'Edit Item' : 'New Menu Item'}</h2>
              <div className="space-y-3">
                <select value={itemForm.categoryId || activeCategory || ''} onChange={(e) => setItemForm((f) => ({ ...f, categoryId: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input value={itemForm.name} onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))} placeholder="Item name *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <textarea value={itemForm.description} onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={itemForm.basePrice} onChange={(e) => setItemForm((f) => ({ ...f, basePrice: e.target.value }))} placeholder="Price *" type="number" min="0" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  <input value={itemForm.calories} onChange={(e) => setItemForm((f) => ({ ...f, calories: e.target.value }))} placeholder="Calories" type="number" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Prep time (min)</label>
                    <input value={itemForm.preparationTime} onChange={(e) => setItemForm((f) => ({ ...f, preparationTime: e.target.value }))} type="number" min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Spice level (0-3)</label>
                    <select value={itemForm.spiceLevel} onChange={(e) => setItemForm((f) => ({ ...f, spiceLevel: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                      <option value="0">None</option>
                      <option value="1">Mild 🌶️</option>
                      <option value="2">Medium 🌶️🌶️</option>
                      <option value="3">Hot 🌶️🌶️🌶️</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  {[['isVegetarian', '🥦 Vegetarian'], ['isVegan', '🌱 Vegan'], ['isFeatured', "⭐ Chef's Pick"]].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={(itemForm as any)[key]} onChange={(e) => setItemForm((f) => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                      <span className="text-sm text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setShowItemForm(false); setEditItem(null); }} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={saveItem} disabled={saving} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-60">
                  {saving ? 'Saving...' : editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
