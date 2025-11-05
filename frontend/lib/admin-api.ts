import apiClient from './api';

export interface AdminResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'buyer';
  isActive: boolean;
  createdAt: string;
}

export interface UserStats {
  totalProducts?: number;
  totalOrders?: number;
  completedOrders?: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface UserDetailsResponse {
  user: User;
  stats: UserStats;
}

export interface DashboardStats {
  users: {
    total: number;
    sellers: number;
    buyers: number;
    admins: number;
  };
  products: {
    total: number;
    byCategory: Array<{ _id: string; count: number }>;
  };
  orders: {
    total: number;
    recent: number;
    byStatus: Array<{ _id: string; count: number }>;
    monthlyTrends: Array<{
      _id: { year: number; month: number };
      count: number;
      revenue: number;
    }>;
  };
  revenue: {
    total: number;
  };
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  status?: string;
}

export interface BanUserData {
  action: 'ban' | 'unban';
}

// Admin API functions
export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<AdminResponse & { data: DashboardStats }> => {
    const response = await apiClient.get('/api/admin/dashboard');
    return response.data;
  },

  // Get all users with filtering and pagination
  getUsers: async (filters?: UserFilters): Promise<AdminResponse & { data: UsersResponse }> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`/api/admin/users?${params.toString()}`);
    return response.data;
  },

  // Get user details by ID
  getUserById: async (userId: string): Promise<AdminResponse & { data: UserDetailsResponse }> => {
    const response = await apiClient.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Ban or unban user
  toggleUserBan: async (userId: string, action: 'ban' | 'unban'): Promise<AdminResponse> => {
    const response = await apiClient.put(`/api/admin/users/${userId}/ban`, { action });
    return response.data;
  },

  // Helper functions for easier usage
  banUser: async (userId: string): Promise<AdminResponse> => {
    return adminApi.toggleUserBan(userId, 'ban');
  },

  unbanUser: async (userId: string): Promise<AdminResponse> => {
    return adminApi.toggleUserBan(userId, 'unban');
  },
};