import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  isVegetarian: boolean;
  ingredients: string[];
  available: boolean;
  createdAt: Date;
}

interface MenuStore {
  items: MenuItem[];
  addItem: (item: Omit<MenuItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, item: Partial<MenuItem>) => void;
  deleteItem: (id: string) => void;
  toggleAvailability: (id: string) => void;
  initializeDefaultItems: () => void;
}

const defaultMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella, tomatoes, and basil',
    price: 350,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
    rating: 4.5,
    isVegetarian: true,
    ingredients: ['Mozzarella', 'Tomatoes', 'Basil', 'Olive Oil'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Grilled Chicken',
    description: 'Tender grilled chicken breast with herbs and spices',
    price: 400,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500',
    rating: 4.7,
    isVegetarian: false,
    ingredients: ['Chicken', 'Herbs', 'Spices', 'Lemon'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing and croutons',
    price: 250,
    category: 'Appetizer',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500',
    rating: 4.3,
    isVegetarian: true,
    ingredients: ['Romaine Lettuce', 'Caesar Dressing', 'Croutons', 'Parmesan'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
    price: 380,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500',
    rating: 4.6,
    isVegetarian: false,
    ingredients: ['Pasta', 'Bacon', 'Eggs', 'Parmesan', 'Cream'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 120,
    category: 'Beverage',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
    rating: 4.8,
    isVegetarian: true,
    ingredients: ['Fresh Oranges'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '6',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with chocolate ganache',
    price: 200,
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    rating: 4.9,
    isVegetarian: true,
    ingredients: ['Chocolate', 'Flour', 'Eggs', 'Sugar', 'Butter'],
    available: true,
    createdAt: new Date('2024-01-01'),
  },
];

export const useMenuStore = create<MenuStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const newItem: MenuItem = {
          ...item,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },
      
      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },
      
      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      toggleAvailability: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, available: !item.available } : item
          ),
        }));
      },
      
      initializeDefaultItems: () => {
        const currentItems = get().items;
        if (currentItems.length === 0) {
          set({ items: defaultMenuItems });
        }
      },
    }),
    {
      name: 'menu-storage',
    }
  )
);
