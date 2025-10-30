import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Toaster } from 'react-hot-toast';
import FileUpload from './components/FileUpload';
import InvoicesTab from './components/InvoicesTab';
import ProductsTab from './components/ProductsTab';
import CustomersTab from './components/CustomersTab';
import { BarChart3, FileText, Package, Users } from 'lucide-react';
import AnalyticsTab from './components/AnalyticsTab';


import './index.css';
const App = () => {
  const [activeTab, setActiveTab] = useState('upload');

  
  const tabs = [
  { id: 'upload', label: 'Upload Files', icon: FileText },
  { id: 'invoices', label: 'Invoices', icon: BarChart3 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 }, // NEW
];

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 5000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 6000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Invoice Management System
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  AI-Powered Data Extraction & Management
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <h1 className="text-lg font-medium text-gray-700">SWIPE</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm
                        transition-all duration-200 flex items-center justify-center space-x-2
                        ${
                          isActive
                            ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'upload' && <FileUpload />}
              {activeTab === 'invoices' && <InvoicesTab />}
              {activeTab === 'products' && <ProductsTab />}
              {activeTab === 'customers' && <CustomersTab />}
              {activeTab === 'analytics' && <AnalyticsTab />}  
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
          <div className="text-center text-sm text-gray-600">
            <p>Done By Nithyajeevan</p>
            <p className="mt-1">© 2025 Invoice Management System</p>
          </div>
        </footer>
      </div>
    </Provider>
  );
};

export default App;
