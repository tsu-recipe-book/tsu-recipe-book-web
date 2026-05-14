import api from './axios';
import type { DishListItem, DishDto, DishCategory, ProductFlag } from '../types/api';

export interface DishFilters {
  search?: string;
  category?: DishCategory;
  flags?: ProductFlag[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const dishService = {
  getDishes: async (filters: DishFilters = {}): Promise<DishListItem[]> => {
    const response = await api.get<DishListItem[]>('/api/v1/dishes', { params: filters });
    return response.data;
  },

  getDish: async (id: string): Promise<DishDto> => {
    const response = await api.get<DishDto>(`/api/v1/dishes/${id}`);
    return response.data;
  },

  deleteDish: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/dishes/${id}`);
  },

  createDish: async (data: FormData): Promise<DishDto> => {
    const response = await api.post<DishDto>('/api/v1/dishes', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateDish: async (id: string, data: FormData): Promise<DishDto> => {
    const response = await api.put<DishDto>(`/api/v1/dishes/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
