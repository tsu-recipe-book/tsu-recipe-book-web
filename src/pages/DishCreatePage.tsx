import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { dishService } from '../api/dishes';
import { DishForm } from '../components/dishes/DishForm';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';

const DishCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutateAsync: createDish, isPending } = useMutation({
    mutationFn: (data: FormData) => dishService.createDish(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
      navigate('/dishes');
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="sticky top-16 z-20 bg-gray-50/80 backdrop-blur-md py-6 mb-8 border-b border-gray-100 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/dishes')}
            className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest mb-1"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            {t('dishes.backToList')}
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('dishes.createNew')}</h1>
        </div>
      </div>

      <DishForm onSubmit={createDish} isLoading={isPending} />

      {/* Floating Action Pill */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          type="submit"
          form="dish-form"
          disabled={isPending}
          className="group flex items-center px-8 py-4 bg-indigo-600 text-white font-black rounded-full shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-300"
        >
          {isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
              <span className="text-lg">{t('common.save')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DishCreatePage;
