import { create } from 'zustand';
import { api } from '@/lib/api';

export interface ServiceRequest {
  id: string;
  serviceType: string;
  description: string;
  roomId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  requestedTime?: string;
  assignedStaffId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceStore {
  requests: ServiceRequest[];
  currentRequest: ServiceRequest | null;
  loading: boolean;
  error: string | null;

  // Actions
  createServiceRequest: (resortId: string, roomId: string, requestData: any) => Promise<ServiceRequest>;
  fetchServiceRequestsByRoom: (resortId: string, roomId: string) => Promise<void>;
  fetchServiceRequestById: (resortId: string, requestId: string) => Promise<void>;
  updateServiceRequest: (resortId: string, requestId: string, updateData: any, token: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearRequests: () => void;
}

export const useServiceStore = create<ServiceStore>((set) => ({
  requests: [],
  currentRequest: null,
  loading: false,
  error: null,

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  clearRequests: () => set({ requests: [], currentRequest: null }),

  createServiceRequest: async (resortId: string, roomId: string, requestData: any) => {
    set({ loading: true, error: null });
    try {
      const request = await api.createServiceRequest(resortId, roomId, requestData);
      set((state) => ({
        requests: [...state.requests, request],
        currentRequest: request,
        loading: false,
      }));
      return request;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service request';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  fetchServiceRequestsByRoom: async (resortId: string, roomId: string) => {
    set({ loading: true, error: null });
    try {
      const requests = await api.getServiceRequestsByRoom(resortId, roomId);
      set({ requests, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch service requests';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  fetchServiceRequestById: async (resortId: string, requestId: string) => {
    set({ loading: true, error: null });
    try {
      const request = await api.getServiceRequestById(resortId, requestId);
      set({ currentRequest: request, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch service request';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  updateServiceRequest: async (resortId: string, requestId: string, updateData: any, token: string) => {
    set({ loading: true, error: null });
    try {
      const updatedRequest = await api.updateServiceRequest(resortId, requestId, updateData, token);
      set((state) => ({
        requests: state.requests.map((r) => (r.id === requestId ? updatedRequest : r)),
        currentRequest: state.currentRequest?.id === requestId ? updatedRequest : state.currentRequest,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service request';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },
}));
