import apiClient from './api';

export interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  documents: string[];
  sellerId: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  category: string;
  price: number;
}

export interface ProductResponse {
  success: boolean;
  data?: Product | Product[];
  message?: string;
  error?: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  sortBy?: 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Product API functions
export const productApi = {
  // Get all products with optional filters
  getProducts: async (filters?: ProductFilters): Promise<ProductResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(`/api/products?${params.toString()}`);
    return response.data;
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<ProductResponse> => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },

  // Create new product (seller only)
  createProduct: async (productData: ProductFormData): Promise<ProductResponse> => {
    const response = await apiClient.post('/api/products', productData);
    return response.data;
  },

  // Update product (seller only)
  updateProduct: async (id: string, productData: Partial<ProductFormData>): Promise<ProductResponse> => {
    const response = await apiClient.put(`/api/products/${id}`, productData);
    return response.data;
  },

  // Delete product (seller only)
  deleteProduct: async (id: string): Promise<ProductResponse> => {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response.data;
  },

  // Upload product images
  uploadImages: async (productId: string, images: File[]): Promise<ProductResponse> => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    const response = await apiClient.post(`/api/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload product documents (PDFs)
  uploadDocuments: async (productId: string, documents: File[]): Promise<ProductResponse> => {
    const formData = new FormData();
    documents.forEach((doc) => {
      formData.append('documents', doc);
    });
    
    const response = await apiClient.post(`/api/products/${productId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Remove product image
  removeImage: async (productId: string, imageUrl: string): Promise<ProductResponse> => {
    const response = await apiClient.delete(`/api/products/${productId}/images`, {
      data: { imageUrl }
    });
    return response.data;
  },

  // Remove product document
  removeDocument: async (productId: string, documentUrl: string): Promise<ProductResponse> => {
    const response = await apiClient.delete(`/api/products/${productId}/documents`, {
      data: { documentUrl }
    });
    return response.data;
  },
};