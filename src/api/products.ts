import api from './axios';
import type { ProductListItem, ProductDto, ProductCategory, ProductStatus, ProductFlag } from '../types/api';

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  cookingRequired?: ProductStatus;
  flags?: ProductFlag[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productService = {
  getProducts: async (filters: ProductFilters = {}): Promise<ProductListItem[]> => {
    const response = await api.get<ProductListItem[]>('/api/v1/products', { params: filters });
    return response.data;
  },

  getProduct: async (id: string): Promise<ProductDto> => {
    const response = await api.get<ProductDto>(`/api/v1/products/${id}`);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/products/${id}`);
  },

  createProduct: async (data: FormData): Promise<ProductDto> => {
    const response = await api.post<ProductDto>('/api/v1/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateProduct: async (id: string, data: FormData): Promise<ProductDto> => {
    const response = await api.put<ProductDto>(`/api/v1/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
