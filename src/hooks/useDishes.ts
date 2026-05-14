import { useQuery } from '@tanstack/react-query';
import { dishService } from '../api/dishes';
import type { DishFilters } from '../api/dishes';

export const useDishes = (filters: DishFilters = {}) => {
  return useQuery({
    queryKey: ['dishes', filters],
    queryFn: () => dishService.getDishes(filters),
  });
};
