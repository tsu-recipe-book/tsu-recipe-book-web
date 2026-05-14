import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../api/products';
import { ProductForm } from '../components/products/ProductForm';
import { ArrowLeft, Loader2 } from 'lucide-react';

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading: isFetching } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id!),
    enabled: !!id,
  });

  const { mutateAsync: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: (data: FormData) => productService.updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      navigate(`/products/${id}`);
    },
  });

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Edit Product</h1>
        <p className="text-gray-500 mt-2">Update information and nutrition details for {product?.name}.</p>
      </div>

      <ProductForm 
        initialData={product} 
        onSubmit={updateProduct} 
        isLoading={isUpdating} 
      />
    </div>
  );
};

export default ProductEditPage;
