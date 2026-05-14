import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductListPage from './pages/ProductListPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductEditPage from './pages/ProductEditPage';
import DishListPage from './pages/DishListPage';
import DishDetailsPage from './pages/DishDetailsPage';
import DishCreatePage from './pages/DishCreatePage';
import DishEditPage from './pages/DishEditPage';
import { Languages } from 'lucide-react';

function App() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('ru') ? 'en' : 'ru';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100/50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
                <span className="text-2xl font-black text-indigo-600 tracking-tighter">RecipeBook</span>
              </div>
              <div className="flex space-x-1">
                <a href="/products" className="text-gray-900 px-4 py-2 rounded-xl text-sm font-black hover:bg-gray-50 transition-colors">
                  {t('nav.products')}
                </a>
                <a href="/dishes" className="text-gray-500 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-black hover:bg-indigo-50 transition-colors">
                  {t('nav.dishes')}
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center px-4 py-2 border border-gray-100 rounded-xl text-xs font-black text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-all uppercase tracking-widest"
              >
                <Languages className="w-4 h-4 mr-2 text-indigo-500" />
                {i18n.language.slice(0, 2)}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductCreatePage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/products/:id/edit" element={<ProductEditPage />} />
          <Route path="/dishes" element={<DishListPage />} />
          <Route path="/dishes/new" element={<DishCreatePage />} />
          <Route path="/dishes/:id" element={<DishDetailsPage />} />
          <Route path="/dishes/:id/edit" element={<DishEditPage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
