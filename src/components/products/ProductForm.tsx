import React, { useState } from 'react';
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

const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: 'READY_TO_EAT', label: 'Ready to Eat' },
  { value: 'SEMI_FINISHED', label: 'Semi-Finished' },
  { value: 'REQUIRES_COOKING', label: 'Requires Cooking' }
];

const FLAGS: ProductFlag[] = ['VEGAN', 'GLUTEN_FREE', 'SUGAR_FREE'];

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<ProductCategory>(initialData?.category || 'VEGETABLES');
  const [cookingRequired, setCookingRequired] = useState<ProductStatus>(initialData?.cookingRequired || 'READY_TO_EAT');
  const [calories, setCalories] = useState(initialData?.calories || 0);
  const [protein, setProtein] = useState(initialData?.protein || 0);
  const [fat, setFat] = useState(initialData?.fat || 0);
  const [carbs, setCarbs] = useState(initialData?.carbs || 0);
  const [selectedFlags, setSelectedFlags] = useState<ProductFlag[]>(initialData?.flags || []);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(initialData?.photoUrls || []);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    // If it's a new file, remove it from files array
    // This is a simplified logic, in production you'd track indices better
    setFiles(prev => prev.filter((_, i) => i !== (index - (initialData?.photoUrls.length || 0))));
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
      setError('Name must be at least 2 characters long');
      return;
    }

    if (protein + fat + carbs > 100) {
      setError('Sum of Protein, Fat, and Carbs cannot exceed 100g per 100g');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('cookingRequired', cookingRequired);
    formData.append('calories', calories.toString());
    formData.append('protein', protein.toString());
    formData.append('fat', fat.toString());
    formData.append('carbs', carbs.toString());
    
    selectedFlags.forEach(flag => formData.append('flags', flag));
    files.forEach(file => formData.append('files', file));

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
            <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Chicken Breast"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
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
            <label className="block text-sm font-bold text-gray-700 mb-3">Dietary Flags</label>
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
                  {flag.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition */}
        <div className="space-y-6">
          <label className="block text-sm font-bold text-gray-700">Nutrition per 100g</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Flame className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input
                type="number"
                value={calories}
                onChange={e => setCalories(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Calories"
              />
            </div>
            <div className="relative">
              <Dna className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                type="number"
                value={protein}
                onChange={e => setProtein(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Protein"
              />
            </div>
            <div className="relative">
              <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="number"
                value={fat}
                onChange={e => setFat(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Fat"
              />
            </div>
            <div className="relative">
              <Carrot className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
              <input
                type="number"
                value={carbs}
                onChange={e => setCarbs(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Carbs"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Photos</label>
            <div className="grid grid-cols-4 gap-4">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all text-gray-400">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Add</span>
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
              Saving...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              {initialData ? 'Update Product' : 'Create Product'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
