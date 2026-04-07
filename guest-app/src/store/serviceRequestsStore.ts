import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceIcon: string;
  roomId: string;
  guestName?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  notes: string;
  timestamp: Date;
  assignedTo?: string;
  estimatedTime?: number;
}

interface ServiceRequestsStore {
  requests: ServiceRequest[];
  addRequest: (request: Omit<ServiceRequest, 'id' | 'timestamp' | 'status'>) => string;
  updateRequestStatus: (id: string, status: ServiceRequest['status'], assignedTo?: string) => void;
  getRequestsByRoom: (roomId: string) => ServiceRequest[];
  getPendingRequests: () => ServiceRequest[];
}

export const useServiceRequestsStore = create<ServiceRequestsStore>()(
  persist(
    (set, get) => ({
      requests: [],
      
      addRequest: (requestData) => {
        const newRequest: ServiceRequest = {
          ...requestData,
          id: `SRV-${Date.now()}`,
          timestamp: new Date(),
          status: 'pending',
        };
        
        set((state) => ({ 
          requests: [newRequest, ...state.requests] 
        }));
        
        return newRequest.id;
      },
      
      updateRequestStatus: (id, status, assignedTo) => {
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id 
              ? { ...request, status, ...(assignedTo && { assignedTo }) } 
              : request
          ),
        }));
      },
      
      getRequestsByRoom: (roomId) => {
        return get().requests.filter((request) => request.roomId === roomId);
      },
      
      getPendingRequests: () => {
        return get().requests.filter((request) => 
          request.status === 'pending' || request.status === 'assigned'
        );
      },
    }),
    {
      name: 'service-requests-storage',
    }
  )
);
