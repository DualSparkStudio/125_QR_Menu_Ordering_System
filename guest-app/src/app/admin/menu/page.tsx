'use client';

import { useState, useEffect } from 'react';
import { useMenuStore } from '@/store/menuStore';

export default function MenuManagementPage() {
  const { items, addItem, toggleAvailability, updateItem, initializeDefaultItems } = useMenuStore();
  const [filter, setFilter] = useState<'all' | string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    image: '',
    rating: 4.5,
    isVegetarian: false,
    ingredients: '',
    available: true,
  });

  useEffect(() => {
    initializeDefaultItems();
  }, [initializeDefaultItems]);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.description || newItem.price <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    addItem({
      ...newItem,
      ingredients: newItem.ingredients.split(',').map(i => i.trim()).filter(i => i),
    });

    // Reset form
    setNewItem({
      name: '',
      description: '',
      price: 0,
      category: 'Main Course',
      image: '',
      rating: 4.5,
      isVegetarian: false,
      ingredients: '',
      available: true,
    });
    setShowCreateModal(false);
  };

  const handleViewItem = (item: any) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    updateItem(selectedItem.id, {
      ...selectedItem,
      ingredients: typeof selectedItem.ingredients === 'string' 
        ? selectedItem.ingredients.split(',').map((i: string) => i.trim()).filter((i: string) => i)
        : selectedItem.ingredients,
    });

    setShowEditModal(false);
    setSelectedItem(null);
  };

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];
  const filteredItems = filter === 'all' ? items : items.filter(item => item.category === filter);

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pista-900 mb-2">Menu Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage menu items and availability</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-pista-500 hover:bg-pista-600 text-white font-bold px-4 sm:px-6 py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <span className="text-xl">+</span>
          <span className="text-sm sm:text-base">Create New Item</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Total Items</p>
          <p className="text-2xl font-bold text-pista-900">{items.length}</p>
        </div>
        <div className="glass-effect border-2 border-green-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Available</p>
          <p className="text-2xl font-bold text-green-700">{items.filter(i => i.available).length}</p>
        </div>
        <div className="glass-effect border-2 border-red-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Unavailable</p>
          <p className="text-2xl font-bold text-red-700">{items.filter(i => !i.available).length}</p>
        </div>
        <div className="glass-effect border-2 border-blue-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Categories</p>
          <p className="text-2xl font-bold text-blue-700">{categories.length - 1}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === category
                ? 'bg-pista-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-pista-200 hover:border-pista-400'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Menu Items Table */}
      <div className="glass-effect border-2 border-pista-200 rounded-xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pista-100 border-b-2 border-pista-200">
              <tr>
                <th className="text-left p-4 text-sm font-bold text-pista-900">Item Name</th>
                <th className="text-left p-4 text-sm font-bold text-pista-900">Category</th>
                <th className="text-left p-4 text-sm font-bold text-pista-900">Price</th>
                <th className="text-left p-4 text-sm font-bold text-pista-900">Rating</th>
                <th className="text-left p-4 text-sm font-bold text-pista-900">Type</th>
                <th className="text-left p-4 text-sm font-bold text-pista-900">Status</th>
                <th className="text-left p-4 text-sm font-bold text-pista-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id} className={`border-b border-pista-100 hover:bg-pista-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.description.substring(0, 50)}...</p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">{item.category}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-pista-700">₹{item.price}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold text-gray-900">{item.rating}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      item.isVegetarian ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.isVegetarian ? '🥬 Veg' : '🍖 Non-Veg'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                      item.available 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewItem(item)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-lg transition"
                        title="View"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-lg transition"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => toggleAvailability(item.id)}
                        className={`p-2 rounded-lg text-lg transition ${
                          item.available
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        title={item.available ? 'Disable' : 'Enable'}
                      >
                        {item.available ? '🚫' : '✅'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-pista-100">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-4 hover:bg-pista-50 transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{item.description.substring(0, 60)}...</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-pista-100 text-pista-700 rounded-full">{item.category}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      item.isVegetarian ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.isVegetarian ? '🥬 Veg' : '🍖 Non-Veg'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-pista-700 text-lg">₹{item.price}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold text-gray-900 text-sm">{item.rating}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewItem(item)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-base transition"
                    title="View"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => handleEditItem(item)}
                    className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-base transition"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`p-2 rounded-lg text-base transition ${
                      item.available
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                    title={item.available ? 'Disable' : 'Enable'}
                  >
                    {item.available ? '🚫' : '✅'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No menu items found</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-pista-900 mb-4">Create New Menu Item</h2>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                  >
                    <option value="Appetizer">Appetizer</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                  <input
                    type="number"
                    value={newItem.rating}
                    onChange={(e) => setNewItem({ ...newItem, rating: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients (comma-separated)</label>
                <input
                  type="text"
                  value={newItem.ingredients}
                  onChange={(e) => setNewItem({ ...newItem, ingredients: e.target.value })}
                  placeholder="Tomatoes, Cheese, Basil"
                  className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={newItem.isVegetarian}
                  onChange={(e) => setNewItem({ ...newItem, isVegetarian: e.target.checked })}
                  className="w-5 h-5 text-pista-500 border-2 border-pista-300 rounded focus:ring-2 focus:ring-pista-500"
                />
                <label className="text-sm font-semibold text-gray-700">Vegetarian</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-pista-500 hover:bg-pista-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Create Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-pista-900">View Menu Item</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {selectedItem.image && (
                <div className="w-full h-64 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x300/93C572/FFFFFF?text=' + encodeURIComponent(selectedItem.name);
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Item Name</label>
                  <p className="text-lg font-bold text-gray-900">{selectedItem.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                  <p className="text-lg text-gray-900">{selectedItem.category}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                <p className="text-gray-900">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Price</label>
                  <p className="text-xl font-bold text-pista-700">₹{selectedItem.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Rating</label>
                  <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    {selectedItem.rating}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Type</label>
                  <span className={`inline-block text-sm px-3 py-1 rounded-full font-semibold ${
                    selectedItem.isVegetarian ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedItem.isVegetarian ? '🥬 Vegetarian' : '🍖 Non-Vegetarian'}
                  </span>
                </div>
              </div>

              {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Ingredients</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.ingredients.map((ingredient: string, index: number) => (
                      <span key={index} className="bg-pista-100 text-pista-700 px-3 py-1 rounded-full text-sm">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                <span className={`inline-block text-sm px-4 py-2 rounded-lg font-bold ${
                  selectedItem.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedItem.available ? '✓ Available' : '✗ Unavailable'}
                </span>
              </div>

              <button
                onClick={() => setShowViewModal(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-pista-900 mb-4">Edit Menu Item</h2>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={selectedItem.name}
                    onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={selectedItem.category}
                    onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                  >
                    <option value="Appetizer">Appetizer</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={selectedItem.description}
                  onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={selectedItem.price}
                    onChange={(e) => setSelectedItem({ ...selectedItem, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                  <input
                    type="number"
                    value={selectedItem.rating}
                    onChange={(e) => setSelectedItem({ ...selectedItem, rating: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={selectedItem.image}
                  onChange={(e) => setSelectedItem({ ...selectedItem, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(selectedItem.ingredients) ? selectedItem.ingredients.join(', ') : selectedItem.ingredients}
                  onChange={(e) => setSelectedItem({ ...selectedItem, ingredients: e.target.value })}
                  placeholder="Tomatoes, Cheese, Basil"
                  className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedItem.isVegetarian}
                  onChange={(e) => setSelectedItem({ ...selectedItem, isVegetarian: e.target.checked })}
                  className="w-5 h-5 text-pista-500 border-2 border-pista-300 rounded focus:ring-2 focus:ring-pista-500"
                />
                <label className="text-sm font-semibold text-gray-700">Vegetarian</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-pista-500 hover:bg-pista-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Update Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
