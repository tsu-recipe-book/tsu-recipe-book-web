import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDishes } from '../hooks/useDishes';
import { Search, Filter, Plus } from 'lucide-react';
import { DishCard } from '../components/dishes/DishCard';
import type { DishCategory, ProductFlag } from '../types/api';
import type { DishFilters } from '../api/dishes';

const CATEGORIES: DishCategory[] = [
  'DESSERT', 'FIRST', 'SECOND', 'DRINK', 'SALAD', 'SOUP', 'SNACK'
];

const DishListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const FLAGS: ProductFlag[] = [
    'VEGAN', 'GLUTEN_FREE', 'SUGAR_FREE'
  ];

  const [filters, setFilters] = useState<DishFilters>({
    search: '',
    category: undefined,
    flags: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: dishes, isLoading, error } = useDishes(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const toggleFlag = (flag: ProductFlag) => {
    setFilters(prev => {
      const currentFlags = prev.flags || [];
      const newFlags = currentFlags.includes(flag)
        ? currentFlags.filter(f => f !== flag)
        : [...currentFlags, flag];
      return { ...prev, flags: newFlags };
    });
  };

  const clearFilters = () => {
    setFilters({
      search: filters.search,
      category: undefined,
      flags: [],
    });
  };

  if (error) return <div className="text-red-500 p-10">{t('common.errorLoading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('dishes.listTitle')}</h1>
        <button
          onClick={() => navigate('/dishes/new')}
          className="group inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 active:scale-95 transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
          {t('dishes.createNew')}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('dishes.form.searchPlaceholder')}
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-12 pr-4 py-3 w-full border border-gray-100 bg-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`inline-flex items-center px-6 py-3 border rounded-2xl text-sm font-bold transition-all shadow-sm ${isFilterOpen || (filters.category || (filters.flags?.length ?? 0) > 0)
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                : 'border-gray-100 text-gray-600 bg-white hover:bg-gray-50'
              }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {t('products.filters.title')}
            {(filters.category || (filters.flags?.length ?? 0) > 0) && (
              <span className="ml-2 w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>

        {isFilterOpen && (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">{t('products.filters.advanced')}</h2>
              <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider">
                {t('products.filters.reset')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('dishes.form.category')}</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilters(prev => ({ ...prev, category: prev.category === cat ? undefined : cat }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filters.category === cat
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      {t(`dishes.categories.${cat}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('products.form.dietaryFlags')}</label>
                <div className="flex flex-wrap gap-2">
                  {FLAGS.map(flag => (
                    <button
                      key={flag}
                      onClick={() => toggleFlag(flag)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filters.flags?.includes(flag)
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      {t(`products.flags.${flag}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl h-80 border border-gray-100 animate-pulse shadow-sm">
              <div className="h-48 bg-gray-50 rounded-t-3xl" />
              <div className="p-6 space-y-4">
                <div className="h-5 bg-gray-50 rounded-lg w-3/4" />
                <div className="h-4 bg-gray-50 rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : dishes?.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[32px] border border-dashed border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Search className="w-8 h-8" />
          </div>
          <p className="text-gray-500 font-medium">{t('dishes.noDishesFound')}</p>
          <button onClick={clearFilters} className="mt-4 text-indigo-600 font-bold uppercase tracking-wider text-sm hover:text-indigo-700">{t('products.filters.reset')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {dishes?.map((dish) => (
            <DishCard 
              key={dish.id} 
              dish={dish} 
              onClick={() => navigate(`/dishes/${dish.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DishListPage;
