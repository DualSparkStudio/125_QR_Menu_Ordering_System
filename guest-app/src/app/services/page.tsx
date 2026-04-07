'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NotificationCenter from '@/components/NotificationCenter';
import { useNotificationStore } from '@/store/notificationStore';
import { useServicesStore } from '@/store/servicesStore';

export const dynamic = 'force-dynamic';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedTime: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface ServiceRequest {
  id: string;
  service: Service;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes: string;
  timestamp: Date;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const { addNotification } = useNotificationStore();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const services: Service[] = [
    {
      id: '1',
      name: 'Room Cleaning',
      description: 'Professional housekeeping service with premium amenities',
      icon: '🧹',
      estimatedTime: 30,
      priority: 'normal',
    },
    {
      id: '2',
      name: 'Laundry Service',
      description: 'Express wash, iron, and delivery to your room',
      icon: '👕',
      estimatedTime: 120,
      priority: 'normal',
    },
    {
      id: '3',
      name: 'Maintenance',
      description: 'Quick repairs and technical support',
      icon: '🔧',
      estimatedTime: 45,
      priority: 'normal',
    },
    {
      id: '4',
      name: 'Towel & Linens',
      description: 'Fresh towels, linens, and bedding replacement',
      icon: '🛁',
      estimatedTime: 15,
      priority: 'low',
    },
    {
      id: '5',
      name: 'Extra Bedding',
      description: 'Additional pillows, blankets, and comfort items',
      icon: '🛏️',
      estimatedTime: 10,
      priority: 'low',
    },
    {
      id: '6',
      name: 'Room Inspection',
      description: 'Comprehensive room check and issue assessment',
      icon: '✓',
      estimatedTime: 20,
      priority: 'normal',
    },
  ];

  const handleSubmitRequest = (service: Service) => {
    if (!notes.trim() && priority === 'urgent') {
      setError('Please provide details for urgent requests');
      return;
    }

    const newRequest: ServiceRequest = {
      id: Date.now().toString(),
      service,
      priority,
      notes,
      timestamp: new Date(),
      status: 'pending',
    };
    setRequests([...requests, newRequest]);
    setSelectedService(null);
    setPriority('normal');
    setNotes('');
    setShowForm(false);
    setError('');

    addNotification({
      type: 'service',
      title: 'Service Request Submitted',
      message: `Your ${service.name} request has been submitted with ${priority} priority`,
    });
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-500/30 text-red-200 border-red-500/50';
      case 'high':
        return 'bg-orange-500/30 text-orange-200 border-orange-500/50';
      case 'normal':
        return 'bg-yellow-500/30 text-yellow-200 border-yellow-500/50';
      case 'low':
        return 'bg-green-500/30 text-green-200 border-green-500/50';
      default:
        return 'bg-slate-500/30 text-slate-200 border-slate-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/30 text-green-200 border-green-500/50';
      case 'in_progress':
        return 'bg-blue-500/30 text-blue-200 border-blue-500/50';
      case 'assigned':
        return 'bg-purple-500/30 text-purple-200 border-purple-500/50';
      case 'pending':
        return 'bg-yellow-500/30 text-yellow-200 border-yellow-500/50';
      default:
        return 'bg-slate-500/30 text-slate-200 border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen pista-gradient">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pista-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pista-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="glass-effect border-b border-pista-200 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pista-900">Room Services</h1>
            <p className="text-pista-600 text-sm">Room {roomId}</p>
          </div>
          <div className="flex gap-3">
            <NotificationCenter />
            <Link href="/" className="bg-white hover:bg-gray-50 text-pista-700 px-5 py-2 rounded-lg transition border border-pista-200 font-medium text-sm shadow-sm">
              ← Back
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-pista-900 mb-2">Available Services</h2>
          <p className="text-gray-600 text-lg">Request housekeeping and maintenance services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}?roomId=${roomId}`}
              className="group relative overflow-hidden glass-effect border-2 border-pista-200 rounded-2xl hover:border-pista-400 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.03] cursor-pointer"
            >
              {/* Service Image */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-pista-100 to-pista-200">
                <img
                  src={
                    service.id === '1' ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop' :
                    service.id === '2' ? 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&h=400&fit=crop' :
                    service.id === '3' ? 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop' :
                    service.id === '4' ? 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=600&h=400&fit=crop' :
                    service.id === '5' ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop' :
                    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=400&fit=crop'
                  }
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Priority Badge */}
                <span className={`absolute top-4 right-4 text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg ${
                  service.priority === 'urgent' ? 'bg-red-500 text-white' :
                  service.priority === 'high' ? 'bg-orange-500 text-white' :
                  service.priority === 'normal' ? 'bg-yellow-400 text-gray-900' :
                  'bg-green-500 text-white'
                }`}>
                  {service.priority.charAt(0).toUpperCase() + service.priority.slice(1)}
                </span>
              </div>

              {/* Service Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-pista-900 text-2xl group-hover:text-pista-700 transition">{service.name}</h3>
                  <span className="text-4xl ml-3">{service.icon}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-pista-200">
                  <div className="flex items-center gap-2 text-pista-600">
                    <span className="text-lg">⏱️</span>
                    <span className="text-sm font-medium">~{service.estimatedTime} min</span>
                  </div>
                  <span className="text-pista-600 font-semibold group-hover:text-pista-700 transition flex items-center gap-2">
                    Request Service
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Active Requests Section */}
        {requests.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-pista-900 mb-6">Your Active Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((request) => (
                <div key={request.id} className="glass-effect border border-pista-200 rounded-xl p-5 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{request.service.icon}</span>
                      <div>
                        <p className="font-semibold text-pista-900">{request.service.name}</p>
                        <p className={`text-xs px-2 py-1 rounded-full inline-block mt-1 font-semibold ${
                          request.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                          request.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          request.status === 'assigned' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      request.priority === 'urgent' ? 'bg-red-100 text-red-700 border border-red-200' :
                      request.priority === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      request.priority === 'normal' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {request.priority.toUpperCase()}
                    </span>
                  </div>
                  {request.notes && (
                    <p className="text-xs text-gray-600 mt-2 italic">"{request.notes}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    {new Date(request.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
