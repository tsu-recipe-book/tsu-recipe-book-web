import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../api/products';
import { ProductForm } from '../components/products/ProductForm';
import { ArrowLeft } from 'lucide-react';

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: createProduct, isPending } = useMutation({
    mutationFn: (data: FormData) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={() => navigate('/products')}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </button>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Create New Product</h1>
        <p className="text-gray-500 mt-2">Add a new base ingredient with nutrition facts to your library.</p>
      </div>

      <ProductForm onSubmit={createProduct} isLoading={isPending} />
    </div>
  );
};

export default ProductCreatePage;
