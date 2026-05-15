import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  X,
  Search,
  Utensils,
  ImageIcon,
  Scale,
  Trash2,
  Calculator
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import type {
  DishDto,
  DishCategory,
  ProductListItem,
  ProductDto,
  ProductFlag
} from '../../types/api';
import { cn } from '../../utils/cn';
import { getImageUrl } from '../../utils/imageUrl';

interface DishFormProps {
  initialData?: DishDto;
  onSubmit: (data: FormData) => Promise<any>;
  isLoading?: boolean;
}

const CATEGORIES: DishCategory[] = [
  'DESSERT', 'FIRST', 'SECOND', 'DRINK', 'SALAD', 'SOUP', 'SNACK'
];

const FLAGS: ProductFlag[] = ['VEGAN', 'GLUTEN_FREE', 'SUGAR_FREE'];

interface SelectedIngredient {
  product: ProductListItem | ProductDto;
  weight: number;
}

export const DishForm: React.FC<DishFormProps> = ({ initialData, onSubmit }) => {
  const { t } = useTranslation();

  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<DishCategory>(initialData?.category || 'SECOND');
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>(
    initialData?.ingredients.map(ing => ({
      product: { id: ing.productId, name: ing.productName, calories: 0 } as any, // Simple stub
      weight: ing.weight
    })) || []
  );

  const [selectedFlags, setSelectedFlags] = useState<ProductFlag[]>(initialData?.flags || []);

  const [manualCalories, setManualCalories] = useState<string>(initialData?.calories !== undefined ? String(initialData.calories) : '');
  const [manualProteins, setManualProteins] = useState<string>(initialData?.proteins !== undefined ? String(initialData.proteins) : '');
  const [manualFats, setManualFats] = useState<string>(initialData?.fats !== undefined ? String(initialData.fats) : '');
  const [manualCarbs, setManualCarbs] = useState<string>(initialData?.carbohydrates !== undefined ? String(initialData.carbohydrates) : '');
  const [manualPortion, setManualPortion] = useState<string>(initialData?.portionSize !== undefined ? String(initialData.portionSize) : '');

  const [existingPhotos, setExistingPhotos] = useState<string[]>(initialData?.photos || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [productSearch, setProductSearch] = useState('');
  const { data: searchResults } = useProducts({ search: productSearch });

  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...files]);

      const previews = files.map(file => URL.createObjectURL(file));
      setNewPreviews(prev => [...prev, ...previews]);
    }
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addIngredient = (product: ProductListItem) => {
    if (selectedIngredients.some(ing => ing.product.id === product.id)) return;
    setSelectedIngredients(prev => [...prev, { product, weight: 100 }]);
    setProductSearch('');
  };

  const updateWeight = (productId: string, weight: number) => {
    setSelectedIngredients(prev => prev.map(ing =>
      ing.product.id === productId ? { ...ing, weight } : ing
    ));
  };

  const removeIngredient = (productId: string) => {
    setSelectedIngredients(prev => prev.filter(ing => ing.product.id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('products.form.nameError'));
      return;
    }
    if (selectedIngredients.length === 0) {
      setError(t('dishes.form.ingredientsError'));
      return;
    }

    const p = parseFloat(manualProteins || '0');
    const f = parseFloat(manualFats || '0');
    const c = parseFloat(manualCarbs || '0');
    
    if (p + f + c > 100) {
      setError(t('products.form.nutritionError'));
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);

    // Format ingredients for backend: productId:weight
    selectedIngredients.forEach((ing, index) => {
      formData.append(`ingredients[${index}].productId`, ing.product.id);
      formData.append(`ingredients[${index}].weight`, ing.weight.toString());
    });

    selectedFlags.forEach(flag => formData.append('flags', flag));

    newFiles.forEach(file => {
      formData.append('photos', file);
    });

    if (manualCalories) formData.append('calories', manualCalories);
    if (manualProteins) formData.append('proteins', manualProteins);
    if (manualFats) formData.append('fats', manualFats);
    if (manualCarbs) formData.append('carbohydrates', manualCarbs);
    if (manualPortion) formData.append('portionSize', manualPortion);

    if (initialData) {
      existingPhotos.forEach(url => formData.append('photosToKeep', url));
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      <form id="dish-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Section: Basic Info */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Utensils className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{t('dishes.detailsTitle')}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('dishes.form.name')}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 font-medium"
                placeholder={t('products.form.namePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('dishes.form.category')}</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300",
                      category === cat
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                        : "bg-white border-gray-100 text-gray-500 hover:border-indigo-200 hover:bg-gray-50"
                    )}
                  >
                    {t(`dishes.categories.${cat}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('products.form.dietaryFlags')}</label>
              <div className="flex flex-wrap gap-2">
                {FLAGS.map(flag => (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => setSelectedFlags(prev =>
                      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
                    )}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300",
                      selectedFlags.includes(flag)
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200/50 scale-105"
                        : "bg-white border-gray-100 text-gray-500 hover:border-emerald-200 hover:bg-emerald-50"
                    )}
                  >
                    {t(`products.flags.${flag}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Ingredients */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Plus className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{t('dishes.form.ingredients')}</h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all duration-300 font-medium"
                placeholder={t('products.form.searchPlaceholder')}
              />
              {productSearch && searchResults && (
                <div className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-50 p-2">
                  {searchResults.filter(p => !selectedIngredients.some(ing => ing.product.id === p.id)).map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addIngredient(product)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                    >
                      <span className="font-bold text-gray-700">{product.name}</span>
                      <Plus className="w-4 h-4 text-orange-500" />
                    </button>
                  ))}
                  {searchResults.length === 0 && (
                    <div className="p-4 text-center text-gray-400 text-sm">{t('products.noProductsFound')}</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {selectedIngredients.map((ing) => (
                <div key={ing.product.id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{ing.product.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={ing.weight}
                      onChange={e => updateWeight(ing.product.id, Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-xl border border-gray-100 bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700 text-center"
                    />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('dishes.form.weightUnit')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(ing.product.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {selectedIngredients.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  <Utensils className="w-10 h-10 text-gray-100 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-medium">{t('dishes.form.addIngredientPrompt')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Manual Nutrition Override */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Calculator className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t('dishes.form.manualOverrideTitle')}</h2>
                <p className="text-xs font-medium text-gray-400 mt-0.5">{t('dishes.form.manualOverrideDescription')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('products.form.calories')}</label>
              <input
                type="number" step="0.1" min="0"
                value={manualCalories}
                onChange={e => setManualCalories(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                placeholder={t('dishes.form.calculatedAuto')}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('products.form.protein')}</label>
              <input
                type="number" step="0.1" min="0"
                value={manualProteins}
                onChange={e => setManualProteins(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                placeholder={t('dishes.form.calculatedAuto')}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('products.form.fat')}</label>
              <input
                type="number" step="0.1" min="0"
                value={manualFats}
                onChange={e => setManualFats(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                placeholder={t('dishes.form.calculatedAuto')}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('products.form.carbs')}</label>
              <input
                type="number" step="0.1" min="0"
                value={manualCarbs}
                onChange={e => setManualCarbs(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                placeholder={t('dishes.form.calculatedAuto')}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('dishes.form.portionSize')}</label>
              <input
                type="number" step="0.1" min="0"
                value={manualPortion}
                onChange={e => setManualPortion(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                placeholder={t('dishes.form.calculatedAuto')}
              />
            </div>
          </div>
        </div>

        {/* Section: Assets */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{t('dishes.form.photos')}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingPhotos.map((url, i) => (
              <div key={`existing-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm">
                <img src={getImageUrl(url)} alt="Existing" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(i)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {newPreviews.map((url, i) => (
              <div key={`new-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-100 group shadow-md scale-95 hover:scale-100 transition-all">
                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewPhoto(i)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-[8px] text-white text-center py-1 font-black uppercase tracking-widest">{t('products.form.newAsset')}</div>
              </div>
            ))}
            {existingPhotos.length + newFiles.length < 5 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 text-gray-400 group">
                <Plus className="w-6 h-6 mb-1 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('products.form.addPhoto')}</span>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </form>

      {/* Sticky Preview Panel */}
      <div className="lg:col-span-5 sticky top-24 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('products.form.livePreview')}</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase">{t('products.form.updating')}</span>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-100/50">
                {t(`dishes.categories.${category}`)}
              </span>
              {selectedFlags.map(flag => (
                <span key={flag} className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100/50">
                  {t(`products.flags.${flag}`)}
                </span>
              ))}
            </div>
            <h3 className="text-3xl font-black text-gray-900 leading-tight">
              {name || <span className="text-gray-200">{t('products.form.namePlaceholder')}</span>}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-black text-gray-400 uppercase tracking-widest px-1">
              <span>{t('dishes.form.ingredients')}</span>
              <span>{selectedIngredients.length}</span>
            </div>
            <div className="space-y-2">
              {selectedIngredients.slice(0, 5).map(ing => (
                <div key={ing.product.id} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-700 text-sm">{ing.product.name}</span>
                  <span className="text-xs font-black text-indigo-600">{ing.weight}{t('dishes.form.weightUnit')}</span>
                </div>
              ))}
              {selectedIngredients.length > 5 && (
                <div className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">
                  + {selectedIngredients.length - 5} {t('dishes.form.moreIngredients')}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
              <Calculator className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('products.form.nutritionPer100g')}</p>
              {manualCalories || manualProteins || manualFats || manualCarbs || manualPortion ? (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                  {manualCalories && <div><span className="text-sm font-black text-gray-900">{manualCalories}</span> <span className="text-[10px] font-bold text-gray-500 uppercase">kcal</span></div>}
                  {manualProteins && <div><span className="text-sm font-black text-gray-900">{manualProteins}</span> <span className="text-[10px] font-bold text-gray-500 uppercase">P</span></div>}
                  {manualFats && <div><span className="text-sm font-black text-gray-900">{manualFats}</span> <span className="text-[10px] font-bold text-gray-500 uppercase">F</span></div>}
                  {manualCarbs && <div><span className="text-sm font-black text-gray-900">{manualCarbs}</span> <span className="text-[10px] font-bold text-gray-500 uppercase">C</span></div>}
                  {manualPortion && <div><span className="text-sm font-black text-gray-900">{manualPortion}</span> <span className="text-[10px] font-bold text-gray-500 uppercase">g</span></div>}
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-600 italic">{t('dishes.form.backendCalculationNote')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-indigo-900 rounded-3xl p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <h4 className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">{t('dishes.form.editorTipTitle')}</h4>
          <p className="text-sm font-medium leading-relaxed opacity-90">
            {t('dishes.form.editorTipText')}
          </p>
        </div>
      </div>
    </div>
  );
};
