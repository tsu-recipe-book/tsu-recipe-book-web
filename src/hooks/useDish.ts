import { useQuery } from '@tanstack/react-query';
import { dishService } from '../api/dishes';

export const useDish = (id: string) => {
  return useQuery({
    queryKey: ['dishes', id],
    queryFn: () => dishService.getDish(id),
    enabled: !!id,
  });
};
