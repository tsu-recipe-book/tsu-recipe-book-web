import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDish } from '../hooks/useDish';
import { dishService } from '../api/dishes';
import { 
  ArrowLeft, 
  Flame, 
  Dna, 
  Droplets, 
  Carrot, 
  Tag,
  AlertCircle,
  Trash2,
  Edit,
  Utensils,
  ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';
import { getImageUrl } from '../utils/imageUrl';
import { ErrorState } from '../components/ui/ErrorState';

const DishDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: dish, isLoading, error, refetch } = useDish(id!);

  const handleDelete = async () => {
    if (!id || !window.confirm(t('dishes.deleteConfirm'))) return;
    try {
      await dishService.deleteDish(id);
      navigate('/dishes');
    } catch (err) {
      alert(t('common.error'));
    }
  };

  if (isLoading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="pt-10">
      <ErrorState onRetry={() => refetch()} />
    </div>
  );

  if (!dish) return (
    <div className="text-center py-24 bg-white rounded-[32px] border border-gray-100 shadow-sm">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-20" />
      <h2 className="text-2xl font-bold text-gray-900">{t('dishes.notFound')}</h2>
      <button onClick={() => navigate('/dishes')} className="mt-6 text-indigo-600 font-bold uppercase tracking-wider text-sm hover:underline">
        {t('dishes.backToList')}
      </button>
    </div>
  );

  const nutritionItems = [
    { label: t('products.form.calories'), value: dish.calories, unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: t('products.form.protein'), value: dish.proteins, unit: 'g', icon: Dna, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: t('products.form.fat'), value: dish.fats, unit: 'g', icon: Droplets, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: t('products.form.carbs'), value: dish.carbohydrates, unit: 'g', icon: Carrot, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <button 
          onClick={() => navigate('/dishes')}
          className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/dishes/${id}/edit`)}
            className="inline-flex items-center px-6 py-3 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            {t('common.edit')}
          </button>
          <button 
            onClick={handleDelete}
            className="inline-flex items-center px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('common.delete')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <div className="aspect-square bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center relative">
            {dish.photos.length > 0 ? (
              <img 
                src={getImageUrl(dish.photos[0])} 
                alt={dish.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <Utensils className="w-20 h-20 mb-4 opacity-10" />
                <span className="text-sm font-bold uppercase tracking-widest opacity-30">{t('products.info.noImage')}</span>
              </div>
            )}
          </div>
          {dish.photos.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {dish.photos.slice(1, 5).map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <img src={getImageUrl(url)} alt={`${dish.name} ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-purple-50 text-purple-600 text-xs font-black uppercase tracking-widest border border-purple-100/50">
                <Tag className="w-4 h-4 mr-2" />
                {t(`dishes.categories.${dish.category}`)}
              </span>
              {dish.flags.map(flag => (
                <span key={flag} className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-black rounded-xl uppercase tracking-widest border border-emerald-100/50">
                  {t(`products.flags.${flag}`)}
                </span>
              ))}
            </div>
            <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">{dish.name}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {nutritionItems.map((item) => (
              <div key={item.label} className={cn("p-6 rounded-3xl border border-transparent shadow-sm", item.bg)}>
                <item.icon className={cn("w-6 h-6 mb-3", item.color)} />
                <div className="text-3xl font-black text-gray-900 mb-1">{item.value}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label} ({item.unit})</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{t('dishes.form.ingredients')}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {dish.ingredients.map((ing) => (
                <div 
                  key={ing.productId} 
                  className="px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/products/${ing.productId}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 group-hover:scale-150 transition-transform" />
                    <span className="font-bold text-gray-700">{ing.productName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                      {ing.weight}{t('dishes.form.weightUnit')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishDetailsPage;
