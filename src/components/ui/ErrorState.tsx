import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title, 
  message, 
  onRetry,
  className 
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-col items-center justify-center p-12 bg-white rounded-[32px] border border-red-100 shadow-sm text-center", className)}>
      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">
        {title || t('common.errorTitle')}
      </h3>
      <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto mb-8">
        {message || t('common.errorLoading')}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          {t('common.retry')}
        </button>
      )}
    </div>
  );
};
