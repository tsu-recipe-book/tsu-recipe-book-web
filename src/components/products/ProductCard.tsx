import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame } from 'lucide-react';
import type { ProductListItem, ProductFlag, ProductCategory, ProductStatus } from '../../types/api';
import { cn } from '../../utils/cn';
import { getImageUrl } from '../../utils/imageUrl';

interface ProductCardProps {
  product: Partial<ProductListItem> & { 
    flags?: ProductFlag[];
    category?: ProductCategory;
    cookingRequired?: ProductStatus;
  };
  onClick?: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, className }) => {
  const { t } = useTranslation();

  const getStatusLabel = (status?: ProductStatus) => {
    switch (status) {
      case 'READY_TO_EAT': return t('products.info.readyToEat');
      case 'SEMI_FINISHED': return t('products.info.semiFinished');
      case 'REQUIRES_COOKING': return t('products.info.requiresCooking');
      default: return status || '';
    }
  };

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
        {getImageUrl(product.mainPhoto || (product as any).photos?.[0]) ? (
          <img
            src={getImageUrl(product.mainPhoto || (product as any).photos?.[0])}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
            <div className="w-12 h-12 mb-2 opacity-20 border-2 border-current rounded-lg" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('products.info.noImage')}</span>
          </div>
        )}
        
        {/* Flags Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {product.flags?.map(flag => (
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
            {product.name || <span className="opacity-30 italic">{t('products.form.namePlaceholder')}</span>}
          </h3>
          <div className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg shrink-0">
            <Flame className="w-3 h-3 mr-1 fill-current" />
            {product.calories || 0}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.category && (
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100/50">
              {t(`products.categories.${product.category}`)}
            </span>
          )}
          {product.cookingRequired && (
            <span className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
              product.cookingRequired === 'READY_TO_EAT' 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                : "bg-amber-50 text-amber-600 border-amber-100/50"
            )}>
              {getStatusLabel(product.cookingRequired)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
