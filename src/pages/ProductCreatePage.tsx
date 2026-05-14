import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/products')}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </button>
      
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Product</h1>
        <p className="text-gray-500 italic">Product creation form coming in the next step...</p>
      </div>
    </div>
  );
};

export default ProductCreatePage;
