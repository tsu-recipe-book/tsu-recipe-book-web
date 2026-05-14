import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productService } from '../api/products';
import { ProductForm } from '../components/products/ProductForm';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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
        <p className="text-gray-500 font-medium">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="sticky top-16 z-20 bg-gray-50/80 backdrop-blur-md py-6 mb-8 border-b border-gray-100 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest mb-1"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            {t('common.back')}
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('products.editProduct')}</h1>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">{product?.name}</p>
        </div>
      </div>

      <ProductForm
        initialData={product}
        onSubmit={updateProduct}
        isLoading={isUpdating}
      />

      {/* Floating Action Pill */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          type="submit"
          form="product-form"
          disabled={isUpdating}
          className="group flex items-center px-8 py-4 bg-indigo-600 text-white font-black rounded-full shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-300"
        >
          {isUpdating ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
              <span className="text-lg">{t('products.form.update')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductEditPage;
