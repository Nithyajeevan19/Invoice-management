// import { useSelector } from 'react-redux';
// import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Percent } from 'lucide-react';
// import { useState } from 'react';
// import { Receipt, TrendingUp, DollarSign } from 'lucide-react'; // ADD Receipt here

// const AnalyticsTab = () => {
//   const invoices = useSelector((state) => state.invoices.invoices);
//   const products = useSelector((state) => state.products.products);
//   const customers = useSelector((state) => state.customers.customers);
//   const [dateRange, setDateRange] = useState({ start: '', end: '' });

//     // Filter invoices by date range
//   const filteredInvoices = invoices.filter(inv => {
//     const invDate = new Date(inv.date);
//     const startCheck = dateRange.start ? invDate >= new Date(dateRange.start) : true;
//     const endCheck = dateRange.end ? invDate <= new Date(dateRange.end) : true;
//     return startCheck && endCheck;
//   });

//   // Calculate revenue by product
//   const revenueByProduct = products
//     .filter(p => p.name && p.totalAmount > 0)
//     .map(p => ({
//       name: p.name,
//       revenue: parseFloat(p.priceWithTax) || 0,
//     }))
//     .sort((a, b) => b.revenue - a.revenue);

//   // Calculate top 5 customers by purchase amount
//   const topCustomers = customers
//     .filter(c => c.name && c.totalPurchaseAmount > 0)
//     .sort((a, b) => b.totalPurchaseAmount - a.totalPurchaseAmount)
//     .slice(0, 5)
//     .map(c => ({
//       name: c.name,
//       amount: parseFloat(c.totalPurchaseAmount) || 0,
//     }));

//   // Financial summary
//   const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
//   const totalTax = filteredInvoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
//   const totalDiscounts = products.reduce((sum, p) => sum + (p.discount || 0), 0);
//   const netRevenue = totalRevenue - totalDiscounts;
//   // Calculate tax breakdown across all invoices
//   const taxSummary = filteredInvoices.reduce((acc, inv) => {
//     const breakdown = inv.taxBreakdown || {};
//     return {
//       totalCGST: acc.totalCGST + (breakdown.cgst || 0),
//       totalSGST: acc.totalSGST + (breakdown.sgst || 0),
//       totalIGST: acc.totalIGST + (breakdown.igst || 0),
//       totalTax: acc.totalTax + (breakdown.totalTax || inv.taxAmount || 0),
//     };
//   }, { totalCGST: 0, totalSGST: 0, totalIGST: 0, totalTax: 0 });
  

//   // Colors for pie chart
//   const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

//   if (invoices.length === 0 || products.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-gray-500 text-lg">No data available for analytics</p>
//         <p className="text-gray-400 text-sm mt-2">Upload invoices to see analytics</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full space-y-6">

//         {/* Date Range Picker */}
//         <div className="flex flex-wrap items-end gap-3 mb-4">
//         <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
//             <input
//             type="date"
//             value={dateRange.start}
//             onChange={e => setDateRange(dr => ({ ...dr, start: e.target.value }))}
//             className="px-3 py-2 border border-gray-300 rounded-lg"
//             />
//         </div>
//         <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
//             <input
//             type="date"
//             value={dateRange.end}
//             onChange={e => setDateRange(dr => ({ ...dr, end: e.target.value }))}
//             className="px-3 py-2 border border-gray-300 rounded-lg"
//             />
//         </div>
//         {(dateRange.start || dateRange.end) && (
//             <button
//             onClick={() => setDateRange({ start: '', end: '' })}
//             className="px-3 py-2 bg-gray-300 rounded-lg text-xs hover:bg-gray-400"
//             >
//             Reset
//             </button>
//         )}
//         </div>

//       {/* Financial Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Revenue</p>
//               <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalRevenue.toFixed(2)}</p>
//             </div>
//             <DollarSign className="h-12 w-12 text-blue-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Tax</p>
//               <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalTax.toFixed(2)}</p>
//             </div>
//             <Percent className="h-12 w-12 text-green-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Discounts</p>
//               <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalDiscounts.toFixed(2)}</p>
//             </div>
//             <TrendingUp className="h-12 w-12 text-orange-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Net Revenue</p>
//               <p className="text-3xl font-bold text-gray-900 mt-2">₹{netRevenue.toFixed(2)}</p>
//             </div>
//             <DollarSign className="h-12 w-12 text-purple-500 opacity-20" />
//           </div>
//         </div>

//         {/* Tax Breakdown Card */}
//         <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">GST Collected</p>
//               <p className="text-3xl font-bold text-gray-900 mt-2">₹{taxSummary.totalTax.toFixed(2)}</p>
//               <div className="mt-3 space-y-1">
//                 <p className="text-xs text-gray-500">CGST: ₹{taxSummary.totalCGST.toFixed(2)}</p>
//                 <p className="text-xs text-gray-500">SGST: ₹{taxSummary.totalSGST.toFixed(2)}</p>
//                 <p className="text-xs text-gray-500">IGST: ₹{taxSummary.totalIGST.toFixed(2)}</p>
//               </div>
//             </div>
//             <Receipt className="h-12 w-12 text-indigo-500 opacity-20" />
//           </div>
//         </div>

//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Revenue by Product - Pie Chart */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Product</h3>
//           {revenueByProduct.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={revenueByProduct}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="revenue"
//                 >
//                   {revenueByProduct.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   formatter={(value) => `₹${value.toFixed(2)}`}
//                   contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="text-gray-500">No product data available</p>
//           )}
//         </div>

//         {/* Top Customers - Bar Chart */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Customers</h3>
//           {topCustomers.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={topCustomers}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                 <XAxis dataKey="name" tick={{ fontSize: 12 }} />
//                 <YAxis tick={{ fontSize: 12 }} />
//                 <Tooltip
//                   formatter={(value) => `₹${value.toFixed(2)}`}
//                   contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
//                 />
//                 <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="text-gray-500">No customer data available</p>
//           )}
//         </div>
//       </div>

//       {/* Additional Analytics */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Statistics</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div>
//             <p className="text-sm text-gray-600">Total Invoices</p>
//             <p className="text-2xl font-bold text-gray-900 mt-1">{invoices.length}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Total Products</p>
//             <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Total Customers</p>
//             <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Avg Invoice Value</p>
//             <p className="text-2xl font-bold text-gray-900 mt-1">₹{(totalRevenue / invoices.length).toFixed(2)}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AnalyticsTab;



import { useSelector } from 'react-redux';
import { Receipt, TrendingUp, TrendingDown, DollarSign, Users, Package, AlertCircle, Calendar, PieChart as PieChartIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const AnalyticsTab = () => {
  const invoices = useSelector((state) => state.invoices.invoices);
  const products = useSelector((state) => state.products.products);
  const customers = useSelector((state) => state.customers.customers);
  const payments = useSelector((state) => state.payments?.payments || []);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
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
