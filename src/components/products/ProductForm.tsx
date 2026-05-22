import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  X,
  Flame,
  Image as ImageIcon
} from 'lucide-react';
import type {
  ProductDto,
  ProductCategory,
  ProductStatus,
  ProductFlag
} from '../../types/api';
import { cn } from '../../utils/cn';
import { getImageUrl } from '../../utils/imageUrl';
import { ProductCard } from './ProductCard';

interface ProductFormProps {
  initialData?: ProductDto;
  onSubmit: (data: FormData) => Promise<any>;
  isLoading?: boolean;
}

const CATEGORIES: ProductCategory[] = [
  'FROZEN', 'MEAT', 'VEGETABLES', 'GREENS', 'SPICES',
  'GRAINS', 'CANNED', 'LIQUID', 'SWEETS'
];

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit }) => {
  const { t } = useTranslation();

  const STATUSES: { value: ProductStatus; label: string }[] = [
    { value: 'READY_TO_EAT', label: t('products.info.readyToEat') },
    { value: 'SEMI_FINISHED', label: t('products.info.semiFinished') },
    { value: 'REQUIRES_COOKING', label: t('products.info.requiresCooking') }
  ];

  const FLAGS: ProductFlag[] = ['VEGAN', 'GLUTEN_FREE', 'SUGAR_FREE'];

  const [name, setName] = useState(initialData?.name || '');
  const [composition, setComposition] = useState(initialData?.composition || '');
  const [category, setCategory] = useState<ProductCategory>(initialData?.category || 'VEGETABLES');
  const [cookingRequired, setCookingRequired] = useState<ProductStatus>(initialData?.cookingRequired || 'READY_TO_EAT');
  const [calories, setCalories] = useState(initialData?.calories || 0);
  const [proteins, setProteins] = useState(initialData?.proteins || 0);
  const [fats, setFats] = useState(initialData?.fats || 0);
  const [carbohydrates, setCarbohydrates] = useState(initialData?.carbohydrates || 0);
  const [selectedFlags, setSelectedFlags] = useState<ProductFlag[]>(initialData?.flags || []);
  
  const [existingPhotos, setExistingPhotos] = useState<string[]>(initialData?.photos || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  
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
    setNewPreviews(prev => {
      const url = prev[index];
      URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFlag = (flag: ProductFlag) => {
    setSelectedFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (name.length < 2) {
      setError(t('products.form.nameError'));
      return;
    }

    if (proteins + fats + carbohydrates > 100) {
      setError(t('products.form.nutritionError'));
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('composition', composition);
    formData.append('category', category);
    formData.append('cookingRequired', cookingRequired);
    formData.append('calories', calories.toString());
    formData.append('proteins', proteins.toString());
    formData.append('fats', fats.toString());
    formData.append('carbohydrates', carbohydrates.toString());

    selectedFlags.forEach(flag => formData.append('flags', flag));
    newFiles.forEach(file => formData.append('photos', file));
    
    if (initialData) {
      existingPhotos.forEach(url => formData.append('photosToKeep', url));
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
    }
  };

  const previewProduct = {
    name,
    calories,
    category,
    cookingRequired,
    flags: selectedFlags,
    mainPhoto: newPreviews[0] || existingPhotos[0]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      <form id="product-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Section: Basic Info */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Plus className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{t('products.detailsTitle')}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('products.form.name')}</label>
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
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('products.form.composition')}</label>
              <textarea
                value={composition}
                onChange={e => setComposition(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 font-medium min-h-[120px] resize-none"
                placeholder={t('products.form.compositionPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('products.form.category')}</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none transition-all duration-300 font-medium"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{t(`products.categories.${cat}`)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('products.form.status')}</label>
                <select
                  value={cookingRequired}
                  onChange={e => setCookingRequired(e.target.value as ProductStatus)}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none transition-all duration-300 font-medium"
                >
                  {STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Nutrition */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{t('products.form.nutritionPer100g')}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('products.form.calories')}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={calories}
                  onChange={e => setCalories(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('products.form.protein')}</label>
              <input
                type="number"
                step="0.1"
                value={proteins}
                onChange={e => setProteins(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('products.form.fat')}</label>
              <input
                type="number"
                step="0.1"
                value={fats}
                onChange={e => setFats(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('products.form.carbs')}</label>
              <input
                type="number"
                step="0.1"
                value={carbohydrates}
                onChange={e => setCarbohydrates(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">{t('products.form.dietaryFlags')}</label>
            <div className="flex flex-wrap gap-2">
              {FLAGS.map(flag => (
                <button
                  key={flag}
                  type="button"
                  onClick={() => toggleFlag(flag)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black border transition-all duration-300",
                    selectedFlags.includes(flag)
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                      : "bg-white border-gray-100 text-gray-500 hover:border-indigo-200 hover:bg-gray-50"
                  )}
                >
                  {t(`products.flags.${flag}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Assets */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{t('products.form.photos')}</h2>
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
      <div className="lg:col-span-5 sticky top-8 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('products.form.livePreview')}</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase">{t('products.form.updating')}</span>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
          <ProductCard 
            product={previewProduct} 
            className="relative shadow-2xl scale-105 origin-top-left lg:scale-100 lg:origin-center" 
          />
        </div>

        <div className="bg-indigo-900 rounded-3xl p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <h4 className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">{t('products.form.editorTipTitle')}</h4>
          <p className="text-sm font-medium leading-relaxed opacity-90">
            {t('products.form.editorTipText')}
          </p>
        </div>
      </div>
    </div>
  );
};

