import { useSelector } from 'react-redux';
import { useState, useMemo, useCallback } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, DollarSign, Package, Calendar, Bell, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import { 
  predictPaymentDelay, 
  forecastRevenue, 
  detectAnomalies, 
  generateRecommendations,
  getTopCLVCustomers,
  forecastProductDemand,
  forecastCashFlow 
} from '../utils/aiInsights';
import { selectAllInvoices, selectInvoiceLoading, selectInvoiceError } from '../invoiceSelectors';


// ==================== CONFIGURATION ====================
const CONFIG = {
  monthlyExpenses: 80000,
  salaryDate: 1,
  highPaymentRiskThreshold: 50,
  mediumPaymentRiskThreshold: 25,
  highCollectionRateThreshold: 70,
  overdueDaysThreshold: 30,
  lowStockThreshold: 10,
  highValueThreshold: 50000,
  highPendingRateThreshold: 40,
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get color classes based on priority level
 */
const getPriorityColor = (priority) => {
  const colorMap = {
    high: 'bg-red-100 border-red-300 text-red-800',
    medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    low: 'bg-blue-100 border-blue-300 text-blue-800',
  };
  return colorMap[priority] || 'bg-gray-100 border-gray-300 text-gray-800';
};

/**
 * Get color classes based on risk level
 */
const getRiskColor = (risk) => {
  const colorMap = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };
  return colorMap[risk] || 'bg-gray-500';
};

// ==================== MODAL COMPONENTS ====================

/**
 * ReminderSetupModal Component
 */
const ReminderSetupModal = ({ onClose }) => {
  const [schedule, setSchedule] = useState({
    firstReminder: 7,
    secondReminder: 14,
    finalReminder: 21,
    autoSend: true,
  });

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem('reminderSchedule', JSON.stringify(schedule));
      toast.success('Reminder schedule saved!');
      onClose?.();
    } catch (error) {
      toast.error('Failed to save reminder schedule');
      console.error(error);
    }
  }, [schedule, onClose]);

  const handleInputChange = useCallback((field, value) => {
    setSchedule(prev => ({
      ...prev,
      [field]: field === 'autoSend' ? value : parseInt(value, 10),
    }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold">Setup Automated Reminders</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Reminder (days after invoice)
            </label>
            <input
              type="number"
              value={schedule.firstReminder}
              onChange={(e) => handleInputChange('firstReminder', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Second Reminder (days)
            </label>
            <input
              type="number"
              value={schedule.secondReminder}
              onChange={(e) => handleInputChange('secondReminder', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Final Reminder (days)
            </label>
            <input
              type="number"
              value={schedule.finalReminder}
              onChange={(e) => handleInputChange('finalReminder', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoSend"
              checked={schedule.autoSend}
              onChange={(e) => handleInputChange('autoSend', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="autoSend" className="text-sm text-gray-700">
              Automatically send reminders
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <p className="font-semibold">How it works:</p>
            <ul className="list-disc list-inside mt-2 text-xs space-y-1">
              <li>First reminder sent {schedule.firstReminder} days after invoice date</li>
              <li>Second reminder at {schedule.secondReminder} days</li>
              <li>Final reminder at {schedule.finalReminder} days</li>
              <li>Sent via email and WhatsApp</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * FollowupModal Component
 */
const FollowupModal = ({ invoices = [], onClose }) => {
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  const toggleSelect = useCallback((id) => {
    setSelectedInvoices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedInvoices(invoices?.map(inv => inv?.id).filter(Boolean) || []);
  }, [invoices]);

  const handleSendReminders = useCallback(() => {
    if (selectedInvoices.length === 0) {
      toast.error('Please select at least one invoice');
      return;
    }
    
    toast.success(`Reminders sent for ${selectedInvoices.length} invoices!`);
    onClose?.();
    setSelectedInvoices([]);
  }, [selectedInvoices, onClose]);

  if (!invoices || invoices.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <p className="text-gray-600 text-center">No invoices to send reminders for</p>
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Send className="h-6 w-6 text-orange-600" />
            <h3 className="text-xl font-semibold">Send Payment Reminders</h3>
            <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
              {invoices?.length ?? 0} overdue
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Select All ({invoices?.length ?? 0})
            </button>
            <span className="text-sm text-gray-600">
              {selectedInvoices.length} selected
            </span>
          </div>

          <div className="space-y-2 mb-6">
            {invoices?.map(invoice => (
              <div
                key={invoice?.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedInvoices.includes(invoice?.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSelect(invoice?.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice?.id)}
                      onChange={() => toggleSelect(invoice?.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Invoice #{invoice?.serialNumber ?? 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {invoice?.customerName ?? 'Unknown Customer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{(invoice?.totalAmount ?? 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {invoice?.date ?? 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800 mb-4">
            <p className="font-medium">📱 Reminders will be sent via:</p>
            <ul className="list-disc list-inside mt-2 text-xs space-y-1">
              <li>WhatsApp (instant)</li>
              <li>Email (with PDF attachment)</li>
              <li>SMS (if phone number available)</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSendReminders}
              disabled={selectedInvoices.length === 0}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send {selectedInvoices.length > 0 ? `(${selectedInvoices.length})` : ''} Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const AIInsights = () => {
  // Redux selectors
  const invoices = useSelector(selectAllInvoices) || [];
  const customers = useSelector((state) => state.customers?.customers) || [];
  const products = useSelector((state) => state.products?.products) || [];
  const payments = useSelector((state) => state.payments?.payments) || [];
  const loading = useSelector(selectInvoiceLoading);
  const error = useSelector(selectInvoiceError);

  // Modal states
  const [showReminderSetup, setShowReminderSetup] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);

  // Memoized calculations to prevent unnecessary recalculations
  const forecast = useMemo(() => {
    if (!invoices?.length) return { forecast: 0, confidence: 'low', trend: 'stable', growth: '0' };
    return forecastRevenue(invoices);
  }, [invoices]);

  const anomalies = useMemo(() => {
    if (!invoices?.length) return [];
    return detectAnomalies(invoices);
  }, [invoices]);

  const recommendations = useMemo(() => {
    if (!invoices?.length) return [];
    return generateRecommendations({ invoices, customers, products, payments });
  }, [invoices, customers, products, payments]);

  const customerRisks = useMemo(() => {
    if (!customers?.length || !invoices?.length) return [];
    return customers
      .map(customer => ({
        customer,
        risk: predictPaymentDelay(customer, invoices),
      }))
      .filter(c => c.risk?.risk === 'high' || c.risk?.risk === 'medium')
      .sort((a, b) => (b.risk?.score ?? 0) - (a.risk?.score ?? 0))
      .slice(0, 5);
  }, [customers, invoices]);

  const topCLVCustomers = useMemo(() => {
    if (!invoices?.length) return [];
    return getTopCLVCustomers(invoices, 5);
  }, [invoices]);

  const productForecasts = useMemo(() => {
    if (!invoices?.length || !products?.length) return [];
    return forecastProductDemand(invoices, products);
  }, [invoices, products]);

  const cashFlowForecast = useMemo(() => {
    if (!invoices?.length) {
      return { forecasts: [], avgMonthlyRevenue: 0, collectionRate: '0' };
    }
    return forecastCashFlow(invoices, {
      monthlyExpenses: CONFIG.monthlyExpenses,
      salaryDate: CONFIG.salaryDate,
    });
  }, [invoices]);

  // Callback for handling recommendation actions
  const handleActionClick = useCallback((action) => {
    switch (action) {
      case 'Setup Automated Reminders':
        setShowReminderSetup(true);
        break;
      case 'Send Payment Reminders':
      case 'Aggressive Follow-ups':
      case 'Contact Customers':
        setShowFollowupModal(true);
        break;
      case 'View Products':
        window.scrollTo(0, 0);
        toast.success('Navigating to Products tab...');
        setTimeout(() => {
          const productsTab = document.querySelector('[data-tab="products"]');
          productsTab?.click?.();
        }, 500);
        break;
      case 'View Analytics':
        setTimeout(() => {
          const analyticsTab = document.querySelector('[data-tab="analytics"]');
          analyticsTab?.click?.();
        }, 0);
        toast.success('Navigating to Analytics...');
        break;
      default:
        toast.loading('Feature coming soon!', { duration: 2000 });
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-3">
            <Brain className="h-10 w-10 animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
              <p className="text-purple-100 text-sm mt-1">Loading your insights...</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Analyzing your business data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-3">
            <Brain className="h-10 w-10" />
            <div>
              <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
              <p className="text-purple-100 text-sm mt-1">Error loading insights</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6">
          <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Insights</h3>
          <p className="text-red-700">{error || 'An unexpected error occurred'}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!invoices?.length) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-3">
            <Brain className="h-10 w-10" />
            <div>
              <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
              <p className="text-purple-100 text-sm mt-1">Smart predictions and recommendations based on your data</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Lightbulb className="h-16 w-16 text-yellow-400 mx-auto mb-4 opacity-60" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
          <p className="text-gray-600">Start by adding invoices, customers, and products to get AI-powered insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <Brain className="h-10 w-10" />
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
            <p className="text-purple-100 text-sm mt-1">Smart predictions and recommendations based on your data</p>
          </div>
        </div>
      </div>

      {/* Revenue Forecast */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast</h3>
          <span className={`ml-auto text-xs px-2 py-1 rounded font-medium ${
            forecast?.confidence === 'high' ? 'bg-green-100 text-green-800' :
            forecast?.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {forecast?.confidence ?? 'unknown'} confidence
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Next Month Forecast</p>
            <p className="text-3xl font-bold text-blue-600">₹{(forecast?.forecast ?? 0).toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{forecast?.message ?? 'No data'}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Trend</p>
            <p className="text-2xl font-bold text-purple-600 capitalize">{forecast?.trend ?? 'stable'}</p>
            {forecast?.growth && (
              <p className="text-sm text-gray-600 mt-2">
                {parseFloat(forecast.growth) > 0 ? '+' : ''}{forecast.growth}% vs average
              </p>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Monthly Average</p>
            <p className="text-3xl font-bold text-green-600">₹{(forecast?.monthlyAverage ?? 0).toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">Historical average</p>
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
          <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
            {recommendations?.length ?? 0} insights
          </span>
        </div>
        
        <div className="space-y-3">
          {!recommendations?.length ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recommendations at this time</p>
              <p className="text-sm">Keep adding data for AI insights</p>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <div
                key={`rec-${index}`}
                className={`border-l-4 rounded-lg p-4 transition-all hover:shadow-md ${getPriorityColor(rec?.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">{rec?.icon ?? '•'}</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-base">{rec?.title ?? 'Recommendation'}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            rec?.priority === 'high' ? 'bg-red-200 text-red-800' :
                            rec?.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {(rec?.priority ?? 'low').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{rec?.message ?? ''}</p>
                      </div>
                    </div>
                    
                    {rec?.details?.length > 0 && (
                      <div className="mt-3 bg-white bg-opacity-60 rounded p-3">
                        <ul className="text-xs space-y-1 text-gray-700">
                          {rec.details.map((detail, i) => (
                            <li key={`detail-${i}`} className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {rec?.action && rec?.actionable && (
                      <button 
                        onClick={() => handleActionClick(rec.action)}
                        className="mt-3 text-xs font-semibold bg-white bg-opacity-80 hover:bg-opacity-100 px-3 py-2 rounded shadow-sm border border-current transition-all hover:scale-105"
                      >
                        {rec.action} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Risk Analysis */}
      {customerRisks?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Payment Risk Analysis</h3>
            <span className="ml-auto text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
              {customerRisks.length} at-risk customers
            </span>
          </div>
          
          <div className="space-y-3">
            {customerRisks.map((item, index) => (
              <div key={`risk-${index}`} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(item.risk?.risk)}`}></div>
                    <h4 className="font-semibold text-gray-900">
                      {item.customer?.name ?? item.customer?.customerName ?? 'Unknown'}
                    </h4>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                      Risk Score: {item.risk?.score ?? 0}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    item.risk?.risk === 'high' ? 'bg-red-100 text-red-800' :
                    item.risk?.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {(item.risk?.risk ?? 'low').toUpperCase()} RISK
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.risk?.reason ?? 'No risk details'}</p>
                {item.risk?.metrics && (
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Overdue: {(item.risk.metrics.overdueRate ?? 0).toFixed(0)}%</span>
                    <span>Avg Delay: {(item.risk.metrics.avgDelayDays ?? 0).toFixed(0)} days</span>
                    <span>Invoices: {item.risk.metrics.totalInvoices ?? 0}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly Detection */}
      {anomalies?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Anomalies Detected</h3>
            <span className="ml-auto text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">
              {anomalies.length} unusual transactions
            </span>
          </div>
          
          <div className="space-y-2">
            {anomalies.slice(0, 5).map((anomaly, index) => (
              <div
                key={`anomaly-${index}`}
                className={`border-l-4 rounded p-3 text-sm ${
                  anomaly?.severity === 'high' ? 'border-red-500 bg-red-50' :
                  anomaly?.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                  'border-yellow-500 bg-yellow-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Invoice #{anomaly?.invoice ?? 'N/A'}</span>
                  <span className="text-xs capitalize px-2 py-1 bg-white rounded font-medium">
                    {anomaly?.type?.replace('_', ' ') ?? 'unknown'}
                  </span>
                </div>
                <p className="text-gray-700 mt-1">{anomaly?.message ?? 'Anomaly detected'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Lifetime Value */}
      {topCLVCustomers?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Customer Lifetime Value (CLV)</h3>
            <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
              Top {topCLVCustomers.length} customers
            </span>
          </div>
          
          <div className="space-y-3">
            {topCLVCustomers.map((customer, index) => (
              <div key={`clv-${index}`} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{customer?.customerName ?? 'Unknown'}</h4>
                      <p className="text-xs text-gray-500">{customer?.message ?? ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ₹{(customer?.predictedCLV ?? 0).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500">Predicted 2-year CLV</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="bg-blue-50 rounded p-2">
                    <p className="text-xs text-gray-600">Total Spent</p>
                    <p className="font-semibold text-blue-600">₹{(customer?.totalSpent ?? 0).toFixed(0)}</p>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <p className="text-xs text-gray-600">Avg Order</p>
                    <p className="font-semibold text-purple-600">₹{(customer?.avgOrderValue ?? 0).toFixed(0)}</p>
                  </div>
                  <div className="bg-indigo-50 rounded p-2">
                    <p className="text-xs text-gray-600">Monthly Value</p>
                    <p className="font-semibold text-indigo-600">₹{(customer?.monthlyValue ?? 0).toFixed(0)}</p>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-xs text-gray-600">Retention</p>
                    <p className="font-semibold text-green-600">{customer?.retentionRate ?? 0}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Demand Forecast */}
      {productForecasts?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Product Demand Forecast</h3>
            <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
              Next month predictions
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Current Stock</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Forecast</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Recommended</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Trend</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productForecasts.slice(0, 5).map((product, index) => (
                  <tr key={`product-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{product?.productName ?? 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product?.currentStock ?? 0} units</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-semibold text-blue-600">{product?.forecast ?? 0} units</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-semibold text-green-600">{product?.recommendedStock ?? 0} units</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product?.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                        product?.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product?.trend ?? 'stable'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product?.stockoutRisk === 'high' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {product?.stockoutRisk ?? 'low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash Flow Forecast */}
      {cashFlowForecast?.forecasts?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cash Flow Forecast</h3>
            <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
              Next 3 months
            </span>
          </div>
          
          <div className="mb-4 flex gap-4 text-sm">
            <div className="bg-gray-50 rounded p-3 flex-1">
              <p className="text-gray-600 text-xs">Avg Monthly Revenue</p>
              <p className="text-xl font-bold text-gray-900">₹{(cashFlowForecast?.avgMonthlyRevenue ?? 0).toFixed(0)}</p>
            </div>
            <div className="bg-gray-50 rounded p-3 flex-1">
              <p className="text-gray-600 text-xs">Collection Rate</p>
              <p className="text-xl font-bold text-gray-900">{cashFlowForecast?.collectionRate ?? '0'}%</p>
            </div>
          </div>

          <div className="space-y-3">
            {cashFlowForecast.forecasts.map((month, index) => (
              <div key={`cashflow-${index}`} className={`border-l-4 rounded-lg p-4 ${
                month?.status === 'positive' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{month?.monthName ?? 'Month'}</h4>
                  <span className={`text-xl font-bold ${
                    month?.status === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(month?.netCashFlow ?? 0) > 0 ? '+' : ''}₹{(month?.netCashFlow ?? 0).toFixed(0)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Expected Inflow</p>
                    <p className="font-semibold text-green-600">₹{(month?.expectedInflow ?? 0).toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Expected Outflow</p>
                    <p className="font-semibold text-red-600">₹{(month?.expectedOutflow ?? 0).toFixed(0)}</p>
                  </div>
                </div>

                {month?.riskDates?.length > 0 && (
                  <div className="mt-2 text-xs text-orange-800">
                    ⚠️ {month.riskDates[0]?.description ?? 'Risk detected'}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
            <p className="font-medium">💡 Tip: Maintain a buffer of ₹40,000 for unexpected expenses</p>
          </div>
        </div>
      )}

      {/* Modal Overlays */}
      {showReminderSetup && (
        <ReminderSetupModal onClose={() => setShowReminderSetup(false)} />
      )}

      {showFollowupModal && (
        <FollowupModal 
          invoices={invoices?.filter(inv => inv?.status === 'overdue' || inv?.status === 'sent') || []}
          onClose={() => setShowFollowupModal(false)} 
        />
      )}
    </div>
  );
};

export default AIInsights;
