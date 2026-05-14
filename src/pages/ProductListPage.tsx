import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../hooks/useProducts';
import { Search, Filter, Plus } from 'lucide-react';
import type { ProductCategory, ProductStatus, ProductFlag } from '../types/api';
import type { ProductFilters } from '../api/products';

const CATEGORIES: ProductCategory[] = [
  'FROZEN', 'MEAT', 'VEGETABLES', 'GREENS', 'SPICES', 'GRAINS', 'CANNED', 'LIQUID', 'SWEETS'
];

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const COOKING_STATUSES: ProductStatus[] = [
    'READY_TO_EAT', 'SEMI_FINISHED', 'REQUIRES_COOKING'
  ];

  const FLAGS: ProductFlag[] = [
    'VEGAN', 'GLUTEN_FREE', 'SUGAR_FREE'
  ];

  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: undefined,
    cookingRequired: undefined,
    flags: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: products, isLoading, error } = useProducts(filters);

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
      cookingRequired: undefined,
      flags: [],
    });
  };

  if (error) return <div className="text-red-500 p-10">{t('common.errorLoading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('products.listTitle')}</h1>
        <button
          onClick={() => navigate('/products/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('products.createNew')}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('products.form.searchPlaceholder') || "Search products..."}
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isFilterOpen || (filters.category || filters.cookingRequired || (filters.flags?.length ?? 0) > 0)
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {t('products.filters.title')}
            {(filters.category || filters.cookingRequired || (filters.flags?.length ?? 0) > 0) && (
              <span className="ml-2 w-2 h-2 bg-indigo-600 rounded-full"></span>
            )}
          </button>
        </div>

        {isFilterOpen && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">{t('products.filters.advanced')}</h2>
              <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                {t('products.filters.reset')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('products.form.category')}</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilters(prev => ({ ...prev, category: prev.category === cat ? undefined : cat }))}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filters.category === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {t(`products.categories.${cat}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('products.form.status')}</label>
                <div className="flex flex-wrap gap-2">
                  {COOKING_STATUSES.map(status => (
                    <button
                      key={status}
                      onClick={() => setFilters(prev => ({ ...prev, cookingRequired: prev.cookingRequired === status ? undefined : status }))}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filters.cookingRequired === status
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {status === 'READY_TO_EAT' ? t('products.info.readyToEat') : status === 'SEMI_FINISHED' ? t('products.info.semiFinished') : t('products.info.requiresCooking')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('products.form.dietaryFlags')}</label>
                <div className="flex flex-wrap gap-2">
                  {FLAGS.map(flag => (
                    <button
                      key={flag}
                      onClick={() => toggleFlag(flag)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filters.flags?.includes(flag)
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-64 border border-gray-100 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">{t('products.noProductsFound')}</p>
          <button onClick={clearFilters} className="mt-2 text-indigo-600 font-medium">{t('products.filters.reset')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {product.mainPhotoUrl ? (
                  <img
                    src={product.mainPhotoUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {product.flags.map(flag => (
                    <span key={flag} className="px-2 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-full shadow-sm">
                      {t(`products.flags.${flag}`)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">{product.calories} {t('products.form.caloriesUnit')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">{t(`products.categories.${product.category}`)}</span>
                  <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-[10px] font-bold uppercase tracking-wider">
                    {product.cookingRequired === 'READY_TO_EAT' ? t('products.info.readyToEat') : product.cookingRequired === 'SEMI_FINISHED' ? t('products.info.semiFinished') : t('products.info.requiresCooking')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
