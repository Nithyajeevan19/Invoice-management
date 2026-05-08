import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Receipt, TrendingUp, TrendingDown, DollarSign, Users, 
  Package, AlertCircle, Calendar, Zap, PieChart as PieChartIcon 
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { selectAllInvoices } from '../invoiceSelectors';

const AnalyticsTab = () => {
  const invoices = useSelector(selectAllInvoices);
  // const analytics = useSelector(selectInvoiceAnalytics);
  // const products = useSelector((state) => state.products.products);
  // const customers = useSelector((state) => state.customers.customers);
  // const payments = useSelector((state) => state.payments?.payments || []);


  // ============ CALCULATIONS ============

  // Total Revenue
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  
  // Total Tax Collected
  const taxSummary = invoices.reduce((acc, inv) => {
    const breakdown = inv.taxBreakdown || {};
    return {
      totalCGST: acc.totalCGST + (breakdown.cgst || 0),
      totalSGST: acc.totalSGST + (breakdown.sgst || 0),
      totalIGST: acc.totalIGST + (breakdown.igst || 0),
      totalTax: acc.totalTax + (breakdown.totalTax || inv.taxAmount || 0),
    };
  }, { totalCGST: 0, totalSGST: 0, totalIGST: 0, totalTax: 0 });

  // Payment Statistics
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'draft' || inv.status === 'sent');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  // Revenue by Status (Pie Chart Data)
  const revenueByStatus = [
    { name: 'Paid', value: paidAmount, color: '#10b981' },
    { name: 'Pending', value: pendingAmount, color: '#f59e0b' },
    { name: 'Overdue', value: overdueAmount, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Revenue Trend (Last 30 days)
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const revenueTrend = last30Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayRevenue = invoices
      .filter(inv => inv.date === dayStr)
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    
    return {
      date: format(day, 'MMM dd'),
      revenue: dayRevenue,
    };
  });

  // Top Customers
  const customerRevenue = invoices.reduce((map, inv) => {
    const name = inv.customerName || 'Unknown';
    map[name] = (map[name] || 0) + (inv.totalAmount || 0);
    return map;
  }, {});

  const topCustomers = Object.entries(customerRevenue)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top Products
  const productSales = invoices.reduce((map, inv) => {
    (inv.products || []).forEach(p => {
      const name = p.productName || p.name || 'Unknown';
      if (!map[name]) {
        map[name] = { quantity: 0, revenue: 0 };
      }
      map[name].quantity += p.quantity || 0;
      map[name].revenue += (p.priceWithTax || p.unitPrice || 0) * (p.quantity || 1);
    });
    return map;
  }, {});

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Monthly Comparison (Current vs Last Month)
  const currentMonth = { start: startOfMonth(new Date()), end: endOfMonth(new Date()) };
  const lastMonth = { start: startOfMonth(subDays(new Date(), 30)), end: endOfMonth(subDays(new Date(), 30)) };

  const currentMonthRevenue = invoices
    .filter(inv => {
      const date = new Date(inv.date);
      return date >= currentMonth.start && date <= currentMonth.end;
    })
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  const lastMonthRevenue = invoices
    .filter(inv => {
      const date = new Date(inv.date);
      return date >= lastMonth.start && date <= lastMonth.end;
    })
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  const monthlyGrowth = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : 0;

  // Average Invoice Value
  const avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {format(new Date(), 'PPp')}</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 opacity-80" />
            <div className={`flex items-center gap-1 text-sm ${monthlyGrowth >= 0 ? 'bg-green-500' : 'bg-red-500'} bg-opacity-30 px-2 py-1 rounded`}>
              {monthlyGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(monthlyGrowth)}%
            </div>
          </div>
          <p className="text-sm opacity-80">Total Revenue</p>
          <p className="text-3xl font-bold mt-1">₹{totalRevenue.toFixed(2)}</p>
          <p className="text-xs opacity-70 mt-2">{invoices.length} total invoices</p>
        </div>

        {/* GST Collected */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Receipt className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-sm opacity-80">GST Collected</p>
          <p className="text-3xl font-bold mt-1">₹{taxSummary.totalTax.toFixed(2)}</p>
          <div className="flex gap-3 text-xs opacity-70 mt-2">
            <span>CGST: ₹{taxSummary.totalCGST.toFixed(0)}</span>
            <span>SGST: ₹{taxSummary.totalSGST.toFixed(0)}</span>
            <span>IGST: ₹{taxSummary.totalIGST.toFixed(0)}</span>
          </div>
        </div>

        {/* Paid Amount */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-sm opacity-80">Amount Received</p>
          <p className="text-3xl font-bold mt-1">₹{paidAmount.toFixed(2)}</p>
          <p className="text-xs opacity-70 mt-2">{paidInvoices.length} paid invoices</p>
        </div>

        {/* Pending Amount */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-sm opacity-80">Pending Amount</p>
          <p className="text-3xl font-bold mt-1">₹{(pendingAmount + overdueAmount).toFixed(2)}</p>
          <p className="text-xs opacity-70 mt-2">{pendingInvoices.length + overdueInvoices.length} unpaid invoices</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend - Wider (2/3) */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Revenue Trend
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">Performance over the last 30 days</p>
            </div>
            
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Avg Daily</p>
                <p className="text-sm font-bold text-slate-900">₹{(revenueTrend.reduce((s, d) => s + d.revenue, 0) / 30).toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Peak Day</p>
                <p className="text-sm font-bold text-emerald-600">₹{Math.max(...revenueTrend.map(d => d.revenue)).toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[300px]">
            {revenueTrend.some(d => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    interval={5}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                    }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#revenueGradient)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                  <TrendingUp className="h-6 w-6 text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-900">Insufficient Data</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-[240px]">
                  Upload more invoices to unlock revenue forecasting and trend insights.
                </p>
                <button className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                  + Add New Invoice
                </button>
              </div>
            )}
          </div>
          
          {revenueTrend.some(d => d.revenue > 0) && (
            <div className="mt-4 pt-4 border-t border-slate-50">
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Zap className="h-3 w-3 text-amber-500" />
                <span className="font-medium text-slate-700">Insight:</span>
                {monthlyGrowth > 0 
                  ? `Revenue is up ${monthlyGrowth}% compared to last month. Growth is currently stable.`
                  : "Revenue trend detected. Consider increasing customer outreach to boost month-over-month volume."
                }
              </p>
            </div>
          )}
        </div>

        {/* Revenue by Status - Compact (1/3) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Revenue Mix</h3>
          <p className="text-sm text-slate-500 mb-6">Distribution by status</p>
          
          <div className="flex-1 relative min-h-[200px]">
            {revenueByStatus.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByStatus}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {revenueByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] font-black uppercase text-slate-400">Total</p>
                  <p className="text-lg font-bold text-slate-900">₹{(totalRevenue/1000).toFixed(1)}k</p>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full border-4 border-slate-50 flex items-center justify-center mb-4">
                  <PieChartIcon className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-xs text-slate-400 font-medium">No revenue data found</p>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {revenueByStatus.map((status, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }}></div>
                  <span className="text-slate-600 font-medium">{status.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">₹{(status.value/1000).toFixed(1)}k</span>
                  <span className="text-[10px] text-slate-400 ml-2">({((status.value/totalRevenue)*100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>

          {totalRevenue > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-50">
              <div className="bg-indigo-50/50 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase">Collection Efficiency</span>
                  <span className="text-xs font-black text-indigo-700">{((paidAmount/totalRevenue)*100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-1.5">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${(paidAmount/totalRevenue)*100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Top 5 Customers by Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCustomers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis dataKey="name" type="category" stroke="#6b7280" style={{ fontSize: '12px' }} width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Top 5 Products by Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value, name) => {
                  if (name === 'revenue') return [`₹${value.toFixed(2)}`, 'Revenue'];
                  if (name === 'quantity') return [value, 'Quantity'];
                  return value;
                }}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Average Invoice Value</p>
          <p className="text-2xl font-bold text-gray-900">₹{avgInvoiceValue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">{Object.keys(customerRevenue).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{Object.keys(productSales).length}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
