'use client';

import { useState, useEffect } from 'react';
import { useServicesStore } from '@/store/servicesStore';
import { useServiceRequestsStore, ServiceRequest } from '@/store/serviceRequestsStore';

export default function ServicesManagementPage() {
  const { services, addService, toggleAvailability, initializeDefaultServices } = useServicesStore();
  const { requests, updateRequestStatus } = useServiceRequestsStore();
  const [view, setView] = useState<'services' | 'requests'>('requests');
  const [filter, setFilter] = useState<'all' | string>('all');
  const [requestFilter, setRequestFilter] = useState<'all' | ServiceRequest['status']>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    icon: '🔧',
    image: '',
    price: 0,
    duration: '',
    category: 'Housekeeping',
    features: '',
    available: true,
  });

  useEffect(() => {
    initializeDefaultServices();
  }, [initializeDefaultServices]);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name || !newService.description || !newService.duration) {
      alert('Please fill in all required fields');
      return;
    }

    addService({
      ...newService,
      features: newService.features.split(',').map(f => f.trim()).filter(f => f),
    });

    // Reset form
    setNewService({
      name: '',
      description: '',
      icon: '🔧',
      image: '',
      price: 0,
      duration: '',
      category: 'Housekeeping',
      features: '',
      available: true,
    });
    setShowCreateModal(false);
  };

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))];
  const filteredServices = filter === 'all' ? services : services.filter(s => s.category === filter);
  const filteredRequests = requestFilter === 'all' ? requests : requests.filter(r => r.status === requestFilter);

  const getPriorityColor = (priority: ServiceRequest['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-pista-900 mb-2">Services Management</h1>
          <p className="text-gray-600">Manage service requests and available services</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-pista-500 hover:bg-pista-600 text-white font-bold px-6 py-3 rounded-lg transition shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Create New Service
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('requests')}
          className={`px-6 py-3 rounded-lg font-bold transition ${
            view === 'requests'
              ? 'bg-pista-500 text-white shadow-md'
              : 'bg-white text-gray-700 border-2 border-pista-200 hover:border-pista-400'
          }`}
        >
          Service Requests ({requests.length})
        </button>
        <button
          onClick={() => setView('services')}
          className={`px-6 py-3 rounded-lg font-bold transition ${
            view === 'services'
              ? 'bg-pista-500 text-white shadow-md'
              : 'bg-white text-gray-700 border-2 border-pista-200 hover:border-pista-400'
          }`}
        >
          Manage Services ({services.length})
        </button>
      </div>

      {view === 'requests' ? (
        <>
          {/* Request Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="glass-effect border-2 border-pista-200 rounded-xl p-4">
              <p className="text-xs text-gray-600 uppercase mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-pista-900">{requests.length}</p>
            </div>
            <div className="glass-effect border-2 border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-gray-600 uppercase mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">{requests.filter(r => r.status === 'pending').length}</p>
            </div>
            <div className="glass-effect border-2 border-blue-200 rounded-xl p-4">
              <p className="text-xs text-gray-600 uppercase mb-1">Assigned</p>
              <p className="text-2xl font-bold text-blue-700">{requests.filter(r => r.status === 'assigned').length}</p>
            </div>
            <div className="glass-effect border-2 border-purple-200 rounded-xl p-4">
              <p className="text-xs text-gray-600 uppercase mb-1">In Progress</p>
              <p className="text-2xl font-bold text-purple-700">{requests.filter(r => r.status === 'in_progress').length}</p>
            </div>
            <div className="glass-effect border-2 border-green-200 rounded-xl p-4">
              <p className="text-xs text-gray-600 uppercase mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-700">{requests.filter(r => r.status === 'completed').length}</p>
            </div>
          </div>

          {/* Request Filter */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {(['all', 'pending', 'assigned', 'in_progress', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setRequestFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  requestFilter === status
                    ? 'bg-pista-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-pista-200 hover:border-pista-400'
                }`}
              >
                {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && ` (${requests.filter(r => r.status === status).length})`}
              </button>
            ))}
          </div>

          {/* Requests Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="glass-effect border-2 border-pista-200 rounded-xl p-5 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{request.serviceIcon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-pista-900">{request.serviceName}</h3>
                      <p className="text-sm text-gray-600">Room {request.roomId}</p>
                      <p className="text-xs text-gray-500 font-mono">{request.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold border-2 ${getPriorityColor(request.priority)}`}>
                      {request.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500">
                    {new Date(request.timestamp).toLocaleTimeString()} - {new Date(request.timestamp).toLocaleDateString()}
                  </p>
                  {request.estimatedTime && (
                    <p className="text-sm text-pista-700 font-semibold mt-1">Est. Time: ~{request.estimatedTime} min</p>
                  )}
                </div>

                {request.notes && (
                  <div className="mb-4 bg-pista-50 border border-pista-200 rounded-lg p-3">
                    <p className="text-xs text-pista-600 font-semibold mb-1">Notes:</p>
                    <p className="text-sm text-gray-700">{request.notes}</p>
                  </div>
                )}

                {request.assignedTo && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600">Assigned to: <span className="font-semibold text-pista-700">{request.assignedTo}</span></p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-pista-600 font-semibold uppercase mb-2">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['pending', 'assigned', 'in_progress', 'completed'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateRequestStatus(request.id, status, status === 'assigned' ? 'Staff Member' : undefined)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                          request.status === status
                            ? 'bg-pista-500 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-300'
                        }`}
                      >
                        {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12 glass-effect border-2 border-pista-200 rounded-xl">
              <span className="text-6xl block mb-4">🧹</span>
              <p className="text-gray-500 text-lg font-semibold">No service requests found</p>
              <p className="text-gray-400 text-sm mt-2">Requests will appear here when guests submit them</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Service Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-effect border-2 border-pista-200 rounded-xl p-4">
              <p className="text-xs text-gray-600 uppercase mb-1">Total Services</p>
              <p className="text-2xl font-bold text-pista-900">{services.length}</p>
            </div>
            <div className="glass-effect border-2 border-green-200 rounded-xl p-4">
              <p className="text-xs text-gray-600 uppercase mb-1">Available</p>
              <p className="text-2xl font-bold text-green-700">{services.filter(s => s.available).length}</p>
            </div>
            <div className="glass-effect border-2 border-red-200 rounded-xl p-4">
              <p className="text-xs text-gray-600 uppercase mb-1">Unavailable</p>
              <p className="text-2xl font-bold text-red-700">{services.filter(s => !s.available).length}</p>
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

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <div key={service.id} className="glass-effect border-2 border-pista-200 rounded-xl p-5 hover:shadow-xl transition">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-4xl">{service.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-pista-900">{service.name}</h3>
                    <p className="text-xs text-gray-500">{service.category}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    service.available 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {service.available ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{service.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-pista-700">
                      {service.price === 0 ? 'Free' : `₹${service.price}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900">{service.duration}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-pista-600 font-semibold uppercase mb-2">Features</p>
                  <ul className="space-y-1">
                    {service.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-center gap-2">
                        <span className="w-1 h-1 bg-pista-500 rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                    {service.features.length > 3 && (
                      <li className="text-xs text-pista-600 font-semibold">
                        +{service.features.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => toggleAvailability(service.id)}
                  className={`w-full py-2 rounded-lg font-medium text-sm transition ${
                    service.available
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {service.available ? 'Disable Service' : 'Enable Service'}
                </button>
              </div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No services found</p>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-pista-900 mb-4">Create New Service</h2>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service Name *</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                  >
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Dining">Dining</option>
                    <option value="Assistance">Assistance</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={newService.icon}
                    onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none text-center text-2xl"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration *</label>
                  <input
                    type="text"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    placeholder="30 minutes"
                    className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={newService.image}
                  onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Features (comma-separated)</label>
                <input
                  type="text"
                  value={newService.features}
                  onChange={(e) => setNewService({ ...newService, features: e.target.value })}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-pista-500 hover:bg-pista-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Create Service
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
    </div>
  );
}
