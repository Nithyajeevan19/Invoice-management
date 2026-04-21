import { useSelector } from 'react-redux';
import { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, DollarSign, Package, Calendar,Bell,X,Send } from 'lucide-react';

import { 
  predictPaymentDelay, 
  forecastRevenue, 
  detectAnomalies, 
  generateRecommendations,
  getTopCLVCustomers,
  forecastProductDemand,
  forecastCashFlow 
} from '../utils/aiInsights';
import toast from 'react-hot-toast';

const AIInsights = () => {
  const invoices = useSelector((state) => state.invoices.invoices);
  const customers = useSelector((state) => state.customers.customers);
  const products = useSelector((state) => state.products.products);
  const payments = useSelector((state) => state.payments?.payments || []);
  const [showReminderSetup, setShowReminderSetup] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);

  // Generate insights
  const forecast = forecastRevenue(invoices);
  const anomalies = detectAnomalies(invoices);
  const recommendations = generateRecommendations({ invoices, customers, products, payments });

  // High-risk customers
  const customerRisks = customers.map(customer => ({
    customer,
    risk: predictPaymentDelay(customer, invoices),
  })).filter(c => c.risk.risk === 'high' || c.risk.risk === 'medium')
    .sort((a, b) => b.risk.score - a.risk.score)
    .slice(0, 5);

     const topCLVCustomers = getTopCLVCustomers(invoices, 5);
  const productForecasts = forecastProductDemand(invoices, products);
  const cashFlowForecast = forecastCashFlow(invoices, {
    monthlyExpenses: 80000, // You can make this dynamic
    salaryDate: 1,
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  
    const handleActionClick = (action) => {
        switch(action) {
        case 'Setup Automated Reminders':
            setShowReminderSetup(true);
            break;
        case 'Send Payment Reminders':
        case 'Aggressive Follow-ups':
        case 'Contact Customers':
            setShowFollowupModal(true);
            break;
        case 'View Products':
            // Navigate to Products tab and filter low stock
            window.scrollTo(0, 0);
            toast.success('Navigating to Products tab...');
            // You can emit an event or use React Router here
            setTimeout(() => {
            const productsTab = document.querySelector('[data-tab="products"]');
            if (productsTab) productsTab.click();
            }, 500);
            break;
        case 'View Analytics':
            const analyticsTab = document.querySelector('[data-tab="analytics"]');
            if (analyticsTab) analyticsTab.click();
            toast.success('Navigating to Analytics...');
            break;
        default:
            toast('Feature coming soon!');
        }
    };


    // Reminder Setup Modal
    const ReminderSetupModal = ({ onClose }) => {
    const [schedule, setSchedule] = useState({
        firstReminder: 7,
        secondReminder: 14,
        finalReminder: 21,
        autoSend: true,
    });

    const handleSave = () => {
        localStorage.setItem('reminderSchedule', JSON.stringify(schedule));
        toast.success('Reminder schedule saved!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold">Setup Automated Reminders</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
                onChange={(e) => setSchedule({...schedule, firstReminder: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Second Reminder (days)
                </label>
                <input
                type="number"
                value={schedule.secondReminder}
                onChange={(e) => setSchedule({...schedule, secondReminder: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Reminder (days)
                </label>
                <input
                type="number"
                value={schedule.finalReminder}
                onChange={(e) => setSchedule({...schedule, finalReminder: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                type="checkbox"
                id="autoSend"
                checked={schedule.autoSend}
                onChange={(e) => setSchedule({...schedule, autoSend: e.target.checked})}
                className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="autoSend" className="text-sm text-gray-700">
                Automatically send reminders
                </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p><strong>How it works:</strong></p>
                <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                <li>First reminder sent {schedule.firstReminder} days after invoice date</li>
                <li>Second reminder at {schedule.secondReminder} days</li>
                <li>Final reminder at {schedule.finalReminder} days</li>
                <li>Sent via email and WhatsApp</li>
                </ul>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                Cancel
                </button>
                <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                Save Schedule
                </button>
            </div>
            </div>
        </div>
        </div>
    );
    };



    // Follow-up Modal
    const FollowupModal = ({ invoices, onClose }) => {
    const [selectedInvoices, setSelectedInvoices] = useState([]);

    const toggleSelect = (id) => {
        setSelectedInvoices(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedInvoices(invoices.map(inv => inv.id));
    };

    const handleSendReminders = () => {
        if (selectedInvoices.length === 0) {
        toast.error('Please select at least one invoice');
        return;
        }
        
        // Simulate sending
        toast.success(`Reminders sent for ${selectedInvoices.length} invoices!`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
            <div className="flex items-center gap-2">
                <Send className="h-6 w-6 text-orange-600" />
                <h3 className="text-xl font-semibold">Send Payment Reminders</h3>
                <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                {invoices.length} overdue
                </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
            </button>
            </div>

            <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                Select All ({invoices.length})
                </button>
                <span className="text-sm text-gray-600">
                {selectedInvoices.length} selected
                </span>
            </div>

            <div className="space-y-2 mb-6">
                {invoices.map(invoice => (
                <div
                    key={invoice.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedInvoices.includes(invoice.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSelect(invoice.id)}
                >
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={() => toggleSelect(invoice.id)}
                        className="w-4 h-4"
                        />
                        <div>
                        <p className="font-semibold text-gray-900">
                            Invoice #{invoice.serialNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                            {invoice.customerName}
                        </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-gray-900">
                        ₹{invoice.totalAmount?.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                        Due: {invoice.date}
                        </p>
                    </div>
                    </div>
                </div>
                ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800 mb-4">
                <p className="font-medium">📱 Reminders will be sent via:</p>
                <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                <li>WhatsApp (instant)</li>
                <li>Email (with PDF attachment)</li>
                <li>SMS (if phone number available)</li>
                </ul>
            </div>

            <div className="flex gap-3">
                <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                Cancel
                </button>
                <button
                onClick={handleSendReminders}
                disabled={selectedInvoices.length === 0}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                <Send className="h-4 w-4" />
                Send {selectedInvoices.length > 0 && `(${selectedInvoices.length})`} Reminders
                </button>
            </div>
            </div>
        </div>
        </div>
    );
    };

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
          <span className={`ml-auto text-xs px-2 py-1 rounded ${
            forecast.confidence === 'high' ? 'bg-green-100 text-green-800' :
            forecast.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {forecast.confidence} confidence
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Next Month Forecast</p>
            <p className="text-3xl font-bold text-blue-600">₹{forecast.forecast?.toFixed(2) || 0}</p>
            <p className="text-xs text-gray-500 mt-2">{forecast.message}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Trend</p>
            <p className="text-2xl font-bold text-purple-600 capitalize">{forecast.trend}</p>
            {forecast.growth && (
              <p className="text-sm text-gray-600 mt-2">
                {forecast.growth > 0 ? '+' : ''}{forecast.growth}% vs average
              </p>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Monthly Average</p>
            <p className="text-3xl font-bold text-green-600">₹{forecast.monthlyAverage?.toFixed(2) || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Historical average</p>
          </div>
        </div>
      </div>

        {/* Enhanced Smart Recommendations Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
          <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
            {recommendations.length} insights
          </span>
        </div>
        
        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recommendations at this time</p>
              <p className="text-sm">Keep adding data for AI insights</p>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <div
                key={index}
                className={`border-l-4 rounded-lg p-4 transition-all hover:shadow-md ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">{rec.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-base">{rec.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {rec.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{rec.message}</p>
                      </div>
                    </div>
                    
                    {rec.details && rec.details.length > 0 && (
                      <div className="mt-3 bg-white bg-opacity-60 rounded p-3">
                        <ul className="text-xs space-y-1 text-gray-700">
                          {rec.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* FUNCTIONAL ACTION BUTTON */}
                    {rec.action && rec.actionable && (
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
      {customerRisks.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Payment Risk Analysis</h3>
            <span className="ml-auto text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              {customerRisks.length} at-risk customers
            </span>
          </div>
          
          <div className="space-y-3">
            {customerRisks.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(item.risk.risk)}`}></div>
                    <h4 className="font-semibold text-gray-900">
                      {item.customer.name || item.customer.customerName}
                    </h4>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      Risk Score: {item.risk.score}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    item.risk.risk === 'high' ? 'bg-red-100 text-red-800' :
                    item.risk.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.risk.risk.toUpperCase()} RISK
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.risk.reason}</p>
                {item.risk.metrics && (
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Overdue: {item.risk.metrics.overdueRate?.toFixed(0)}%</span>
                    <span>Avg Delay: {item.risk.metrics.avgDelayDays?.toFixed(0)} days</span>
                    <span>Invoices: {item.risk.metrics.totalInvoices}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly Detection */}
      {anomalies.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Anomalies Detected</h3>
            <span className="ml-auto text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
              {anomalies.length} unusual transactions
            </span>
          </div>
          
          <div className="space-y-2">
            {anomalies.slice(0, 5).map((anomaly, index) => (
              <div
                key={index}
                className={`border-l-4 rounded p-3 text-sm ${
                  anomaly.severity === 'high' ? 'border-red-500 bg-red-50' :
                  anomaly.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                  'border-yellow-500 bg-yellow-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Invoice #{anomaly.invoice}</span>
                  <span className="text-xs capitalize px-2 py-1 bg-white rounded">
                    {anomaly.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-700 mt-1">{anomaly.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      
      {/* Customer Lifetime Value */}
      {topCLVCustomers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Customer Lifetime Value (CLV)</h3>
            <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Top {topCLVCustomers.length} customers
            </span>
          </div>
          
          <div className="space-y-3">
            {topCLVCustomers.map((customer, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{customer.customerName}</h4>
                      <p className="text-xs text-gray-500">{customer.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ₹{customer.predictedCLV.toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500">Predicted 2-year CLV</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="bg-blue-50 rounded p-2">
                    <p className="text-xs text-gray-600">Total Spent</p>
                    <p className="font-semibold text-blue-600">₹{customer.totalSpent.toFixed(0)}</p>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <p className="text-xs text-gray-600">Avg Order</p>
                    <p className="font-semibold text-purple-600">₹{customer.avgOrderValue.toFixed(0)}</p>
                  </div>
                  <div className="bg-indigo-50 rounded p-2">
                    <p className="text-xs text-gray-600">Monthly Value</p>
                    <p className="font-semibold text-indigo-600">₹{customer.monthlyValue.toFixed(0)}</p>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-xs text-gray-600">Retention</p>
                    <p className="font-semibold text-green-600">{customer.retentionRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Demand Forecast */}
      {productForecasts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Product Demand Forecast</h3>
            <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
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
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.productName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.currentStock} units</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-semibold text-blue-600">{product.forecast} units</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-semibold text-green-600">{product.recommendedStock} units</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                        product.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.trend}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.stockoutRisk === 'high' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {product.stockoutRisk}
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
      {cashFlowForecast.forecasts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cash Flow Forecast</h3>
            <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              Next 3 months
            </span>
          </div>
          
          <div className="mb-4 flex gap-4 text-sm">
            <div className="bg-gray-50 rounded p-3 flex-1">
              <p className="text-gray-600 text-xs">Avg Monthly Revenue</p>
              <p className="text-xl font-bold text-gray-900">₹{cashFlowForecast.avgMonthlyRevenue.toFixed(0)}</p>
            </div>
            <div className="bg-gray-50 rounded p-3 flex-1">
              <p className="text-gray-600 text-xs">Collection Rate</p>
              <p className="text-xl font-bold text-gray-900">{cashFlowForecast.collectionRate}%</p>
            </div>
          </div>

          <div className="space-y-3">
            {cashFlowForecast.forecasts.map((month, index) => (
              <div key={index} className={`border-l-4 rounded-lg p-4 ${
                month.status === 'positive' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{month.monthName}</h4>
                  <span className={`text-xl font-bold ${
                    month.status === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {month.netCashFlow > 0 ? '+' : ''}₹{month.netCashFlow.toFixed(0)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Expected Inflow</p>
                    <p className="font-semibold text-green-600">₹{month.expectedInflow.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Expected Outflow</p>
                    <p className="font-semibold text-red-600">₹{month.expectedOutflow.toFixed(0)}</p>
                  </div>
                </div>

                {month.riskDates.length > 0 && (
                  <div className="mt-2 text-xs text-orange-800">
                    ⚠️ {month.riskDates[0].description}
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

      {showReminderSetup && (
        <ReminderSetupModal onClose={() => setShowReminderSetup(false)} />
      )}

      {/* FOLLOW-UP MODAL */}
      {showFollowupModal && (
        <FollowupModal 
          invoices={invoices.filter(inv => inv.status === 'overdue' || inv.status === 'sent')}
          onClose={() => setShowFollowupModal(false)} 
        />
      )}

    </div>
  );
};

export default AIInsights;
