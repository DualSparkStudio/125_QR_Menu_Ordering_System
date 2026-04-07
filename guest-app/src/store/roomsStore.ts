import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: 'Standard' | 'Deluxe' | 'Suite' | 'Presidential';
  status: 'Occupied' | 'Vacant' | 'Maintenance';
  guestName?: string;
  checkIn?: Date;
  checkOut?: Date;
  qrGenerated: boolean;
}

interface RoomsStore {
  rooms: Room[];
  initializeRooms: () => void;
  addRoom: (room: Omit<Room, 'id' | 'qrGenerated'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  markQRGenerated: (id: string) => void;
  getRoomByNumber: (number: string) => Room | undefined;
}

export const useRoomsStore = create<RoomsStore>()(
  persist(
    (set, get) => ({
      rooms: [],
      
      initializeRooms: () => {
        const currentRooms = get().rooms;
        if (currentRooms.length === 0) {
          // Initialize with 30 rooms across 3 floors
          const defaultRooms: Room[] = [];
          
          for (let floor = 1; floor <= 3; floor++) {
            for (let room = 1; room <= 10; room++) {
              const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
              const roomType = 
                room <= 6 ? 'Standard' :
                room <= 8 ? 'Deluxe' :
                room === 9 ? 'Suite' : 'Presidential';
              
              defaultRooms.push({
                id: `room-${roomNumber}`,
                number: roomNumber,
                floor,
                type: roomType,
                status: 'Vacant',
                qrGenerated: false,
              });
            }
          }
          
          set({ rooms: defaultRooms });
        }
      },
      
      addRoom: (roomData) => {
        const newRoom: Room = {
          ...roomData,
          id: `room-${roomData.number}`,
          qrGenerated: false,
        };
        set((state) => ({ rooms: [...state.rooms, newRoom] }));
      },
      
      updateRoom: (id, updates) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === id ? { ...room, ...updates } : room
          ),
        }));
      },
      
      deleteRoom: (id) => {
        set((state) => ({
          rooms: state.rooms.filter((room) => room.id !== id),
        }));
      },
      
      markQRGenerated: (id) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === id ? { ...room, qrGenerated: true } : room
          ),
        }));
      },
      
      getRoomByNumber: (number) => {
        return get().rooms.find((room) => room.number === number);
      },
    }),
    {
      name: 'rooms-storage',
    }
  )
);
