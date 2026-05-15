import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Utensils } from 'lucide-react';
import type { DishListItem, DishCategory, ProductFlag } from '../../types/api';
import { cn } from '../../utils/cn';
import { getImageUrl } from '../../utils/imageUrl';

interface DishCardProps {
  dish: Partial<DishListItem> & {
    flags?: ProductFlag[];
    category?: DishCategory;
  };
  onClick?: () => void;
  className?: string;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onClick, className }) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
        {getImageUrl(dish.mainPhoto || (dish as any).photos?.[0]) ? (
          <img
            src={getImageUrl(dish.mainPhoto || (dish as any).photos?.[0])}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
            <Utensils className="w-12 h-12 mb-2 opacity-10" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('products.info.noImage')}</span>
          </div>
        )}
        
        {/* Flags Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {dish.flags?.map(flag => (
            <span 
              key={flag} 
              className="px-2.5 py-1 text-[9px] font-black bg-white/90 backdrop-blur-sm text-gray-900 rounded-full shadow-sm uppercase tracking-tighter border border-gray-100/50"
            >
              {t(`products.flags.${flag}`)}
            </span>
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
            {dish.name || <span className="opacity-30 italic">{t('dishes.form.namePlaceholder')}</span>}
          </h3>
          <div className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg shrink-0">
            <Flame className="w-3 h-3 mr-1 fill-current" />
            {dish.calories || 0}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-between items-center w-full">
          {dish.category ? (
            <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-purple-100/50">
              {t(`dishes.categories.${dish.category}`)}
            </span>
          ) : <div />}
          {dish.portionSize && (
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
              {dish.portionSize} {t('dishes.form.weightUnit', 'г')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
