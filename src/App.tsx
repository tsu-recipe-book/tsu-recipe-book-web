import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductListPage from './pages/ProductListPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductEditPage from './pages/ProductEditPage';
import { Languages } from 'lucide-react';

function App() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('ru') ? 'en' : 'ru';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
                <span className="text-xl font-bold text-indigo-600 font-mono tracking-tighter">RecipeBook</span>
              </div>
              <div className="flex space-x-4">
                <a href="/products" className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  {t('nav.products')}
                </a>
                <a href="/dishes" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  {t('nav.dishes')}
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center px-3 py-1 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase"
              >
                <Languages className="w-4 h-4 mr-2 text-indigo-500" />
                {i18n.language.slice(0, 2)}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductCreatePage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/products/:id/edit" element={<ProductEditPage />} />
          <Route path="/dishes" element={<div>{t('nav.dishes')} {t('nav.comingSoon')}</div>} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
