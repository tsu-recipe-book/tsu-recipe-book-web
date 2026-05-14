import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productService } from '../api/products';
import { 
  ArrowLeft, 
  Flame, 
  Dna, 
  Droplets, 
  Carrot, 
  ChefHat,
  Tag,
  AlertCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { cn } from '../utils/cn';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id!),
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!id || !window.confirm(t('products.deleteConfirm'))) return;
    try {
      await productService.deleteProduct(id);
      navigate('/products');
    } catch (err) {
      alert(t('products.deleteError'));
    }
  };

  if (isLoading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900">{t('products.notFound')}</h2>
      <button onClick={() => navigate('/products')} className="mt-4 text-indigo-600 font-medium hover:underline">
        {t('products.backToList')}
      </button>
    </div>
  );

  const nutritionItems = [
    { label: t('products.form.calories'), value: product.calories, unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: t('products.form.protein'), value: product.protein, unit: 'g', icon: Dna, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: t('products.form.fat'), value: product.fat, unit: 'g', icon: Droplets, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: t('products.form.carbs'), value: product.carbs, unit: 'g', icon: Carrot, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'READY_TO_EAT': return t('products.info.readyToEat');
      case 'SEMI_FINISHED': return t('products.info.semiFinished');
      case 'REQUIRES_COOKING': return t('products.info.requiresCooking');
      default: return status;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/products')}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/products/${id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            {t('common.edit')}
          </button>
          <button 
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('common.delete')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center">
            {product.photoUrls.length > 0 ? (
              <img 
                src={product.photoUrls[0]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <AlertCircle className="w-12 h-12 mb-2 opacity-20" />
                <span>No images available</span>
              </div>
            )}
          </div>
          {product.photoUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.photoUrls.slice(1, 5).map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <img src={url} alt={`${product.name} ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.flags.map(flag => (
                <span key={flag} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {flag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{product.name}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600">
                <Tag className="w-4 h-4 mr-2" />
                {product.category}
              </span>
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-lg",
                product.cookingRequired === 'READY_TO_EAT' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              )}>
                <ChefHat className="w-4 h-4 mr-2" />
                {getStatusLabel(product.cookingRequired)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {nutritionItems.map((item) => (
              <div key={item.label} className={cn("p-4 rounded-2xl border border-transparent transition-all hover:border-gray-200", item.bg)}>
                <item.icon className={cn("w-5 h-5 mb-2", item.color)} />
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.label} ({item.unit})</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
