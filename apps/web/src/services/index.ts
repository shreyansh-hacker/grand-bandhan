import { apiRequest, ApiResponse, setAuthToken, getAuthToken } from '../lib/api';
import {
  User,
  Enquiry,
  Wedding,
  Vendor,
  Quotation,
  Task,
  WeddingEvent,
  VendorArrival,
  ServiceVerification,
  Payment,
  Settlement,
} from '@grand-bandhan/shared';

// Base API wrapper
export { apiRequest, setAuthToken, getAuthToken };

// ==========================================
// Authentication Service
// ==========================================
export const AuthService = {
  login: async (email: string, password: string) => {
    const res = await apiRequest<{ user: User; accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.success && res.data?.accessToken) {
      setAuthToken(res.data.accessToken);
    }
    return res;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    agencyName: string;
    phone?: string;
  }) => {
    const res = await apiRequest<{ user: User; accessToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success && res.data?.accessToken) {
      setAuthToken(res.data.accessToken);
    }
    return res;
  },

  getMe: async () => {
    return apiRequest<{ user: User }>('/api/auth/me');
  },

  logout: async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setAuthToken(null);
  },
};

// ==========================================
// Enquiry Service
// ==========================================
export const EnquiryService = {
  list: async () => {
    return apiRequest<{ enquiries: Enquiry[] }>('/api/enquiries');
  },

  getById: async (id: string) => {
    return apiRequest<{ enquiry: Enquiry }>(`/api/enquiries/${id}`);
  },

  create: async (data: Partial<Enquiry>) => {
    return apiRequest<{ enquiry: Enquiry }>('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    return apiRequest<{ enquiry: Enquiry }>(`/api/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },
};

// ==========================================
// Wedding Service
// ==========================================
export const WeddingService = {
  list: async () => {
    return apiRequest<{ weddings: Wedding[] }>('/api/weddings');
  },

  getById: async (id: string) => {
    return apiRequest<{ wedding: Wedding }>(`/api/weddings/${id}`);
  },

  create: async (data: Partial<Wedding>) => {
    return apiRequest<{ wedding: Wedding }>('/api/weddings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ==========================================
// Vendor & Quotation Service
// ==========================================
export const VendorService = {
  list: async () => {
    return apiRequest<{ vendors: Vendor[] }>('/api/vendors');
  },

  getById: async (id: string) => {
    return apiRequest<{ vendor: Vendor }>(`/api/vendors/${id}`);
  },

  listQuotations: async (weddingId?: string) => {
    const query = weddingId ? `?weddingId=${weddingId}` : '';
    return apiRequest<{ quotations: Quotation[] }>(`/api/quotations${query}`);
  },

  acceptQuotation: async (quotationId: string) => {
    return apiRequest<{ quotation: Quotation }>(`/api/quotations/${quotationId}/accept`, {
      method: 'PATCH',
    });
  },
};

// ==========================================
// Task Service
// ==========================================
export const TaskService = {
  list: async (weddingId?: string) => {
    const query = weddingId ? `?weddingId=${weddingId}` : '';
    return apiRequest<{ tasks: Task[] }>(`/api/tasks${query}`);
  },

  updateStatus: async (id: string, status: string) => {
    return apiRequest<{ task: Task }>(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// ==========================================
// Event & Arrival Service
// ==========================================
export const EventService = {
  list: async (weddingId?: string) => {
    const query = weddingId ? `?weddingId=${weddingId}` : '';
    return apiRequest<{ events: WeddingEvent[] }>(`/api/events${query}`);
  },

  listArrivals: async (weddingId?: string) => {
    const query = weddingId ? `?weddingId=${weddingId}` : '';
    return apiRequest<{ arrivals: VendorArrival[] }>(`/api/events/arrivals${query}`);
  },

  markArrival: async (arrivalId: string, status: string, notes?: string) => {
    return apiRequest<{ arrival: VendorArrival }>(`/api/events/arrivals/${arrivalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },
};

// ==========================================
// Verification & Escalation Service
// ==========================================
export const VerificationService = {
  list: async (weddingId?: string) => {
    const query = weddingId ? `?weddingId=${weddingId}` : '';
    return apiRequest<{ verifications: ServiceVerification[] }>(`/api/verifications${query}`);
  },

  verify: async (id: string, payload: { status: string; verifiedByRole: string; notes?: string; photoUrl?: string }) => {
    return apiRequest<{ verification: ServiceVerification }>(`/api/verifications/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  escalate: async (id: string, reason: string) => {
    return apiRequest<{ verification: ServiceVerification }>(`/api/verifications/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// ==========================================
// Payment & Settlement Service
// ==========================================
export const PaymentService = {
  listPayments: async (weddingId?: string) => {
    const query = weddingId ? `?weddingId=${weddingId}` : '';
    return apiRequest<{ payments: Payment[] }>(`/api/payments${query}`);
  },

  listSettlements: async (weddingId?: string) => {
    const query = weddingId ? `?weddingId=${weddingId}` : '';
    return apiRequest<{ settlements: Settlement[] }>(`/api/settlements${query}`);
  },
};

// ==========================================
// Binary File Storage (Neon PostgreSQL BYTEA)
// ==========================================
export const StorageService = {
  uploadFile: async (payload: {
    fileName: string;
    mimeType: string;
    fileData: string; // Base64
    entityType?: string;
    entityId?: string;
  }) => {
    return apiRequest<{
      file: {
        id: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        url: string;
        downloadUrl: string;
        storageType: string;
      };
    }>('/api/storage/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getFileUrl: (fileId: string, download = false) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${baseUrl}/api/storage/${fileId}${download ? '?download=true' : ''}`;
  },
};

// ==========================================
// Neon Database Health Service
// ==========================================
export const NeonService = {
  getStatus: async () => {
    return apiRequest<{
      neon: {
        status: string;
        branch: string;
        database?: string;
        user?: string;
        postgresVersion?: string;
        metrics?: Record<string, number>;
      };
    }>('/api/neon/status');
  },
};
