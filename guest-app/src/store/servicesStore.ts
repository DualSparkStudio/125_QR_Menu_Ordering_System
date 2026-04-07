import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RoomService {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  price: number;
  duration: string;
  category: string;
  features: string[];
  available: boolean;
  createdAt: Date;
}

interface ServicesStore {
  services: RoomService[];
  addService: (service: Omit<RoomService, 'id' | 'createdAt'>) => void;
  updateService: (id: string, service: Partial<RoomService>) => void;
  deleteService: (id: string) => void;
  toggleAvailability: (id: string) => void;
  initializeDefaultServices: () => void;
}

const defaultServices: RoomService[] = [
  {
    id: '1',
    name: 'Room Cleaning',
    description: 'Professional housekeeping service for your room',
    icon: '🧹',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500',
    price: 0,
    duration: '30-45 minutes',
    category: 'Housekeeping',
    features: ['Bed making', 'Bathroom cleaning', 'Vacuuming', 'Trash removal'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Laundry Service',
    description: 'Quick and efficient laundry and dry cleaning',
    icon: '👔',
    image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500',
    price: 200,
    duration: '24 hours',
    category: 'Laundry',
    features: ['Washing', 'Ironing', 'Dry cleaning', 'Express service available'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Spa & Massage',
    description: 'Relaxing spa treatments and therapeutic massage',
    icon: '💆',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500',
    price: 1500,
    duration: '60-90 minutes',
    category: 'Wellness',
    features: ['Swedish massage', 'Aromatherapy', 'Hot stone therapy', 'Facial treatments'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    name: 'Airport Transfer',
    description: 'Comfortable transportation to and from the airport',
    icon: '🚗',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500',
    price: 800,
    duration: 'As needed',
    category: 'Transportation',
    features: ['Professional driver', 'Luxury vehicle', 'Flight tracking', 'Meet & greet'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    name: 'Room Service',
    description: 'Order food and beverages delivered to your room',
    icon: '🍽️',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500',
    price: 0,
    duration: '20-30 minutes',
    category: 'Dining',
    features: ['24/7 availability', 'Full menu access', 'Special dietary options', 'In-room dining setup'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '6',
    name: 'Concierge Service',
    description: 'Personal assistance for bookings and recommendations',
    icon: '🎩',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500',
    price: 0,
    duration: 'Immediate',
    category: 'Assistance',
    features: ['Tour bookings', 'Restaurant reservations', 'Event tickets', 'Local recommendations'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
];

export const useServicesStore = create<ServicesStore>()(
  persist(
    (set, get) => ({
      services: [],
      
      addService: (service) => {
        const newService: RoomService = {
          ...service,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set((state) => ({ services: [...state.services, newService] }));
      },
      
      updateService: (id, updates) => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id ? { ...service, ...updates } : service
          ),
        }));
      },
      
      deleteService: (id) => {
        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
        }));
      },
      
      toggleAvailability: (id) => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id ? { ...service, available: !service.available } : service
          ),
        }));
      },
      
      initializeDefaultServices: () => {
        const currentServices = get().services;
        if (currentServices.length === 0) {
          set({ services: defaultServices });
        }
      },
    }),
    {
      name: 'services-storage',
    }
  )
);
