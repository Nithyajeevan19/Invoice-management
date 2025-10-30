import { useSelector } from 'react-redux';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Percent } from 'lucide-react';

const AnalyticsTab = () => {
  const invoices = useSelector((state) => state.invoices.invoices);
  const products = useSelector((state) => state.products.products);
  const customers = useSelector((state) => state.customers.customers);

  // Calculate revenue by product
  const revenueByProduct = products
    .filter(p => p.name && p.totalAmount > 0)
    .map(p => ({
      name: p.name,
      revenue: parseFloat(p.priceWithTax) || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Calculate top 5 customers by purchase amount
  const topCustomers = customers
    .filter(c => c.name && c.totalPurchaseAmount > 0)
    .sort((a, b) => b.totalPurchaseAmount - a.totalPurchaseAmount)
    .slice(0, 5)
    .map(c => ({
      name: c.name,
      amount: parseFloat(c.totalPurchaseAmount) || 0,
    }));

  // Financial summary
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalTax = invoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
  const totalDiscounts = products.reduce((sum, p) => sum + (p.discount || 0), 0);
  const netRevenue = totalRevenue - totalDiscounts;

  // Colors for pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  if (invoices.length === 0 || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No data available for analytics</p>
        <p className="text-gray-400 text-sm mt-2">Upload invoices to see analytics</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tax</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalTax.toFixed(2)}</p>
            </div>
            <Percent className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Discounts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalDiscounts.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{netRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Product - Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Product</h3>
          {revenueByProduct.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByProduct}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueByProduct.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No product data available</p>
          )}
        </div>

        {/* Top Customers - Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Customers</h3>
          {topCustomers.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No customer data available</p>
          )}
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{invoices.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Invoice Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{(totalRevenue / invoices.length).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
