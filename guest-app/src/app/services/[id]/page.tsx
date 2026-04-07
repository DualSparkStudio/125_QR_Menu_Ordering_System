'use client';

import { useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotificationStore } from '@/store/notificationStore';
import { useServiceRequestsStore } from '@/store/serviceRequestsStore';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedTime: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  fullDescription: string;
  features: string[];
}

export default function ServiceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  const serviceId = params.id as string;
  const { addNotification } = useNotificationStore();
  const { addRequest } = useServiceRequestsStore();

  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [notes, setNotes] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const services: Record<string, Service> = {
    '1': {
      id: '1',
      name: 'Room Cleaning',
      description: 'Professional housekeeping service with premium amenities',
      icon: '🧹',
      estimatedTime: 30,
      priority: 'normal',
      fullDescription: 'Our professional housekeeping team provides comprehensive room cleaning services including dusting, vacuuming, bathroom sanitization, and bed making. We use eco-friendly cleaning products and ensure your room is spotless.',
      features: ['Complete room dusting', 'Vacuum cleaning', 'Bathroom deep clean', 'Fresh bed linens', 'Trash removal', 'Surface sanitization'],
    },
    '2': {
      id: '2',
      name: 'Laundry Service',
      description: 'Express wash, iron, and delivery to your room',
      icon: '👕',
      estimatedTime: 120,
      priority: 'normal',
      fullDescription: 'Professional laundry service with same-day delivery. We handle all types of garments with care, including delicate fabrics. Our service includes washing, drying, ironing, and folding.',
      features: ['Wash & dry', 'Professional ironing', 'Stain treatment', 'Delicate fabric care', 'Same-day service', 'Eco-friendly detergents'],
    },
    '3': {
      id: '3',
      name: 'Maintenance',
      description: 'Quick repairs and technical support',
      icon: '🔧',
      estimatedTime: 45,
      priority: 'normal',
      fullDescription: 'Our maintenance team is available 24/7 to handle any technical issues or repairs in your room. From plumbing to electrical work, we ensure everything works perfectly.',
      features: ['Electrical repairs', 'Plumbing fixes', 'AC/Heating service', 'Furniture repair', 'Lock & key service', '24/7 availability'],
    },
    '4': {
      id: '4',
      name: 'Towel & Linens',
      description: 'Fresh towels, linens, and bedding replacement',
      icon: '🛁',
      estimatedTime: 15,
      priority: 'low',
      fullDescription: 'Request fresh towels, bed linens, pillowcases, and other bedding items. All our linens are premium quality, freshly laundered, and sanitized.',
      features: ['Fresh towels', 'Bed sheet change', 'Pillowcase replacement', 'Extra blankets', 'Bath mats', 'Premium quality linens'],
    },
    '5': {
      id: '5',
      name: 'Extra Bedding',
      description: 'Additional pillows, blankets, and comfort items',
      icon: '🛏️',
      estimatedTime: 10,
      priority: 'low',
      fullDescription: 'Need extra comfort? Request additional pillows, blankets, comforters, or other bedding accessories to make your stay more comfortable.',
      features: ['Extra pillows', 'Additional blankets', 'Comforters', 'Mattress toppers', 'Decorative cushions', 'Various firmness options'],
    },
    '6': {
      id: '6',
      name: 'Room Inspection',
      description: 'Comprehensive room check and issue assessment',
      icon: '✓',
      estimatedTime: 20,
      priority: 'normal',
      fullDescription: 'Schedule a comprehensive room inspection to identify and address any issues. Our team will check all amenities, fixtures, and facilities to ensure everything meets our high standards.',
      features: ['Complete room check', 'Amenity verification', 'Safety inspection', 'Functionality test', 'Issue documentation', 'Immediate fixes'],
    },
  };

  const service = services[serviceId];

  if (!service) {
    return (
      <div className="min-h-screen pista-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-pista-900 mb-4">Service not found</p>
          <Link href={`/services?roomId=${roomId}`} className="text-pista-600 hover:text-pista-700 underline">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!notes.trim() && priority === 'urgent') {
      setError('Please provide details for urgent requests');
      return;
    }

    // Add request to store
    addRequest({
      serviceId: service.id,
      serviceName: service.name,
      serviceIcon: service.icon,
      roomId: roomId || 'Unknown',
      priority,
      notes: notes || 'No additional notes',
      estimatedTime: service.estimatedTime,
    });

    // Show success
    setSuccess(true);
    addNotification({
      type: 'service',
      title: 'Service Request Submitted',
      message: `Your ${service.name} request has been submitted with ${priority} priority`,
    });

    setTimeout(() => {
      router.push(`/services?roomId=${roomId}`);
    }, 2000);
  };

  const imageUrl = 
    serviceId === '1' ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=600&fit=crop' :
    serviceId === '2' ? 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1200&h=600&fit=crop' :
    serviceId === '3' ? 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&h=600&fit=crop' :
    serviceId === '4' ? 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=1200&h=600&fit=crop' :
    serviceId === '5' ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=600&fit=crop' :
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=600&fit=crop';

  return (
    <div className="min-h-screen pista-gradient">
      {/* Header */}
      <header className="glass-effect border-b border-pista-200 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-pista-900">{service.name}</h1>
            <p className="text-pista-600 text-sm">Room {roomId}</p>
          </div>
          <Link href={`/services?roomId=${roomId}`} className="bg-white hover:bg-gray-50 text-pista-700 px-5 py-2 rounded-lg transition border border-pista-200 font-medium text-sm shadow-sm">
            ← Back to Services
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl">
          <img
            src={imageUrl}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-8 left-8">
            <span className="text-8xl drop-shadow-2xl mb-4 block">{service.icon}</span>
            <h2 className="text-4xl font-bold text-white mb-2">{service.name}</h2>
            <p className="text-xl text-white/90">{service.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-effect border border-pista-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-pista-900 mb-4">About This Service</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{service.fullDescription}</p>

              <h4 className="text-xl font-bold text-pista-900 mb-4">What's Included</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 bg-pista-50 p-3 rounded-lg border border-pista-200">
                    <span className="text-pista-600 text-xl">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-effect border border-pista-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-pista-900 mb-4">Service Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-pista-600 font-medium mb-1">Estimated Time</p>
                  <p className="text-2xl font-bold text-pista-900">~{service.estimatedTime} min</p>
                </div>
                <div>
                  <p className="text-sm text-pista-600 font-medium mb-1">Default Priority</p>
                  <span className={`inline-block text-sm px-3 py-1 rounded-full font-semibold ${
                    service.priority === 'urgent' ? 'bg-red-100 text-red-700 border border-red-200' :
                    service.priority === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    service.priority === 'normal' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {service.priority.charAt(0).toUpperCase() + service.priority.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="lg:col-span-1">
            <div className="glass-effect border border-pista-200 rounded-xl p-6 sticky top-24 shadow-xl">
              <h3 className="text-xl font-bold text-pista-900 mb-6">Request This Service</h3>

              {success ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✓</div>
                  <p className="text-xl font-bold text-pista-900 mb-2">Request Submitted!</p>
                  <p className="text-gray-600 text-sm">Redirecting you back...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-pista-900 mb-2">Priority Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full bg-white border-2 border-pista-200 text-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none transition"
                    >
                      <option value="low">Low - When convenient</option>
                      <option value="normal">Normal - Standard timing</option>
                      <option value="high">High - As soon as possible</option>
                      <option value="urgent">Urgent - Immediate attention</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pista-900 mb-2">Preferred Time (Optional)</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full bg-white border-2 border-pista-200 text-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pista-900 mb-2">Additional Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or details..."
                      className="w-full bg-white border-2 border-pista-200 text-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none resize-none placeholder-gray-400 transition"
                      rows={4}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-pista-500 hover:bg-pista-600 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-base"
                  >
                    Submit Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
