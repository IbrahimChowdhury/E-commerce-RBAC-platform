import apiClient from './api';

export interface PopulatedUserRef {
  _id: string;
  name?: string;
  email?: string;
}

export interface PopulatedProductRef {
  _id: string;
  title?: string;
  images?: string[];
  price?: number;
}

export interface OrderProduct {
  productId: string | PopulatedProductRef;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderId: string;
  buyerId: string | PopulatedUserRef;
  sellerId: string | PopulatedUserRef;
  products: OrderProduct[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Out for Delivery' | 'Completed' | 'Cancelled';
  paymentMethod: string;
  shippingAddress: string;
  orderDate: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    updatedBy: string | PopulatedUserRef;
  }>;
}

export interface CreateOrderData {
  products: OrderProduct[];
  shippingAddress: string;
  paymentMethod?: string;
}

export interface OrderResponse {
  success: boolean;
  data?: Order | Order[];
  message?: string;
  error?: string;
}

export interface UpdateOrderStatusData {
  status: 'Processing' | 'Out for Delivery' | 'Completed' | 'Cancelled';
}

// Order API functions
export const orderApi = {
  // Create new order
  createOrder: async (orderData: CreateOrderData): Promise<OrderResponse> => {
    const response = await apiClient.post('/api/orders', orderData);
    return response.data;
  },

  // Get user orders (role-based filtering handled by backend)
  getOrders: async (): Promise<OrderResponse> => {
    const response = await apiClient.get('/api/orders');
    return response.data;
  },

  // Get single order by ID
  getOrder: async (id: string): Promise<OrderResponse> => {
    const response = await apiClient.get(`/api/orders/${id}`);
    return response.data;
  },

  // Update order status (seller only)
  updateOrderStatus: async (id: string, statusData: UpdateOrderStatusData): Promise<OrderResponse> => {
    const response = await apiClient.put(`/api/orders/${id}/status`, statusData);
    return response.data;
  },
};