import { useQuery } from '@tanstack/react-query';
import { productService } from '../api/products';
import type { ProductFilters } from '../api/products';

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
  });
}
