import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  X,
  Flame,
  Dna,
  Droplets,
  Carrot,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import type {
  ProductDto,
  ProductCategory,
  ProductStatus,
  ProductFlag
} from '../../types/api';
import { cn } from '../../utils/cn';

interface ProductFormProps {
  initialData?: ProductDto;
  onSubmit: (data: FormData) => Promise<any>;
  isLoading?: boolean;
}

const CATEGORIES: ProductCategory[] = [
  'FROZEN', 'MEAT', 'VEGETABLES', 'GREENS', 'SPICES',
  'GRAINS', 'CANNED', 'LIQUID', 'SWEETS'
];

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading }) => {
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
    formData.append('name', name);
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
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('products.form.name')}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder={t('products.form.namePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('products.form.composition')}</label>
            <textarea
              value={composition}
              onChange={e => setComposition(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[100px]"
              placeholder={t('products.form.compositionPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('products.form.category')}</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{t(`products.categories.${cat}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('products.form.status')}</label>
              <select
                value={cookingRequired}
                onChange={e => setCookingRequired(e.target.value as ProductStatus)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
              >
                {STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">{t('products.form.dietaryFlags')}</label>
            <div className="flex flex-wrap gap-2">
              {FLAGS.map(flag => (
                <button
                  key={flag}
                  type="button"
                  onClick={() => toggleFlag(flag)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold border transition-all",
                    selectedFlags.includes(flag)
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                      : "bg-white border-gray-200 text-gray-500 hover:border-indigo-300"
                  )}
                >
                  {t(`products.flags.${flag}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition */}
        <div className="space-y-6">
          <label className="block text-sm font-bold text-gray-700">{t('products.form.nutritionPer100g')}</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Flame className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input
                type="number"
                step="0.1"
                value={calories}
                onChange={e => setCalories(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder={t('products.form.calories')}
              />
            </div>
            <div className="relative">
              <Dna className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                type="number"
                step="0.1"
                value={proteins}
                onChange={e => setProteins(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t('products.form.protein')}
              />
            </div>
            <div className="relative">
              <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="number"
                step="0.1"
                value={fats}
                onChange={e => setFats(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder={t('products.form.fat')}
              />
            </div>
            <div className="relative">
              <Carrot className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
              <input
                type="number"
                step="0.1"
                value={carbohydrates}
                onChange={e => setCarbohydrates(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder={t('products.form.carbs')}
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">{t('products.form.photos')}</label>
            <div className="grid grid-cols-4 gap-4">
              {/* Existing photos */}
              {existingPhotos.map((url, i) => (
                <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                  <img src={url} alt="Existing" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(i)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* New photo previews */}
              {newPreviews.map((url, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-indigo-200 group">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(i)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-[8px] text-white text-center py-0.5 font-bold uppercase">New</div>
                </div>
              ))}
              {existingPhotos.length + newFiles.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all text-gray-400">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t('products.form.addPhoto')}</span>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('products.form.saving')}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              {initialData ? t('products.form.update') : t('products.form.create')}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

