import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import FileUpload from './features/invoices/components/FileUpload';
import InvoicesTab from './features/invoices/components/InvoicesTab';
import ProductsTab from './features/products/components/ProductsTab';
import CustomersTab from './features/customers/components/CustomersTab';
import { BarChart3, FileText, Package, Users, DollarSign, Brain, LogOut, User as UserIcon } from 'lucide-react';
import AnalyticsTab from './features/invoices/components/AnalyticsTab';
import PaymentsTab from './features/payments/components/PaymentsTab';
import AIInsights from './features/invoices/components/AIInsights';
import Auth from './features/auth/Auth';
import ResetPassword from './features/auth/ResetPassword';
import { supabase } from './lib/supabase';
import { signOut } from './services/auth/authService';
import toast from 'react-hot-toast';
import './index.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    // Check initial session
    /*
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'PASSWORD_RECOVERY') {
        setIsResettingPassword(true);
      }
    });

    return () => subscription.unsubscribe();
    */
    setLoading(false);
    setSession({ user: { email: 'demo@example.com' } });
  }, []);

  const handleLogout = async () => {
    /*
    const { error } = await signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged out successfully");
    }
    */
  };

  const tabs = [
    { id: 'upload', label: 'Upload Files', icon: FileText },
    { id: 'invoices', label: 'Invoices', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  /*
  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        {isResettingPassword ? <ResetPassword /> : <Auth />}
      </>
    );
  }

  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <ResetPassword />
      </div>
    );
  }
  */

  return (
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
              {/* 
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Session</span>
                    <span className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">
                      {session?.user?.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
              */}
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
              {activeTab === 'payments' && <PaymentsTab />}
              {activeTab === 'ai-insights' && <AIInsights />}
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
  );
};

export default App;
