/**
 * AI Insights Service
 * Provides predictive analytics and business intelligence for invoice management
 */

/**
 * Predict payment delay risk for a customer based on payment history
 */
export const predictPaymentDelay = (customer, invoices) => {
  const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
  
  if (customerInvoices.length === 0) {
    return { risk: 'low', score: 0, reason: 'No payment history' };
  }

  let delayCount = 0;
  let totalDaysLate = 0;

  customerInvoices.forEach(inv => {
    if (inv.status === 'overdue') {
      delayCount++;
      const dueDate = new Date(inv.dueDate || inv.invoiceDate);
      const paidDate = new Date(inv.paidDate || new Date());
      const daysLate = Math.floor((paidDate - dueDate) / (1000 * 60 * 60 * 24));
      if (daysLate > 0) totalDaysLate += daysLate;
    }
  });

  const delayRate = delayCount / customerInvoices.length;
  const avgDaysLate = delayCount > 0 ? totalDaysLate / delayCount : 0;

  let risk = 'low';
  let score = 0;

  if (delayRate > 0.5 || avgDaysLate > 30) {
    risk = 'high';
    score = Math.min(100, (delayRate * 60 + (avgDaysLate / 30) * 40));
  } else if (delayRate > 0.25 || avgDaysLate > 15) {
    risk = 'medium';
    score = Math.min(100, (delayRate * 50 + (avgDaysLate / 30) * 50));
  } else if (delayRate > 0) {
    score = delayRate * 30;
  }

  return {
    risk,
    score: Math.round(score),
    delayRate: Math.round(delayRate * 100),
    avgDaysLate: Math.round(avgDaysLate),
  };
};

/**
 * Forecast revenue based on invoice trends
 */
export const forecastRevenue = (invoices) => {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Get invoices from last 6 months
  const sixMonthsAgo = new Date(currentMonth);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = {};
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    monthlyRevenue[monthKey] = 0;
  }

  invoices.forEach(inv => {
    const invoiceDate = new Date(inv.invoiceDate || inv.createdAt);
    if (invoiceDate >= sixMonthsAgo) {
      const monthKey = invoiceDate.toISOString().slice(0, 7);
      if (monthKey in monthlyRevenue) {
        monthlyRevenue[monthKey] += inv.totalAmount || inv.total || 0;
      }
    }
  });

  const revenues = Object.values(monthlyRevenue);
  const avgRevenue = revenues.length > 0 ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0;
  const trend = revenues.length > 1 ? (revenues[0] - revenues[revenues.length - 1]) / revenues[revenues.length - 1] : 0;

  return {
    currentMonth: monthlyRevenue[currentMonth.toISOString().slice(0, 7)] || 0,
    average: Math.round(avgRevenue),
    trend: Math.round(trend * 100),
    forecast: Math.round(avgRevenue * (1 + trend / 100)),
    monthlyBreakdown: monthlyRevenue,
  };
};

/**
 * Detect anomalies in invoice data
 */
export const detectAnomalies = (invoices) => {
  const anomalies = [];

  if (invoices.length < 2) return anomalies;

  // Calculate average invoice amount
  const amounts = invoices.map(inv => inv.totalAmount || inv.total || 0).filter(a => a > 0);
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - avgAmount, 2), 0) / amounts.length);

  // Detect unusual amounts (> 2 standard deviations)
  invoices.forEach(inv => {
    const amount = inv.totalAmount || inv.total || 0;
    if (Math.abs(amount - avgAmount) > 2 * stdDev) {
      anomalies.push({
        type: 'unusual_amount',
        invoiceId: inv.id,
        invoiceNumber: inv.serialNumber,
        message: `Invoice amount ₹${amount.toFixed(2)} is significantly different from average`,
        severity: 'medium',
      });
    }
  });

  // Detect overdue invoices
  const now = new Date();
  invoices.forEach(inv => {
    const dueDate = new Date(inv.dueDate || inv.invoiceDate);
    if (inv.status !== 'paid' && dueDate < now) {
      const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
      anomalies.push({
        type: 'overdue',
        invoiceId: inv.id,
        invoiceNumber: inv.serialNumber,
        message: `Invoice is ${daysOverdue} days overdue`,
        severity: daysOverdue > 30 ? 'high' : 'medium',
      });
    }
  });

  return anomalies;
};

/**
 * Generate business recommendations based on data analysis
 */
export const generateRecommendations = ({ invoices, customers, products, payments }) => {
  const recommendations = [];
  const now = new Date();

  // Check for overdue invoices
  const overdueCount = invoices.filter(inv => {
    const dueDate = new Date(inv.dueDate || inv.invoiceDate);
    return inv.status !== 'paid' && dueDate < now;
  }).length;

  if (overdueCount > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Collect Outstanding Payments',
      description: `You have ${overdueCount} overdue invoices. Focus on collecting these to improve cash flow.`,
      action: 'Send Payment Reminders',
      icon: 'DollarSign',
    });
  }

  // Check for low stock products
  const lowStockProducts = products.filter(p => p.quantity < p.reorderLevel || p.quantity < 10);
  if (lowStockProducts.length > 0) {
    recommendations.push({
      priority: 'medium',
      title: 'Reorder Low Stock Items',
      description: `${lowStockProducts.length} product(s) are running low on stock. Consider reordering soon.`,
      action: 'View Products',
      icon: 'Package',
    });
  }

  // Check for customer concentration risk
  const topCustomerRevenue = invoices.reduce((acc, inv) => {
    acc[inv.customerId] = (acc[inv.customerId] || 0) + (inv.totalAmount || 0);
    return acc;
  }, {});

  const totalRevenue = Object.values(topCustomerRevenue).reduce((a, b) => a + b, 0);
  const top3Revenue = Object.values(topCustomerRevenue)
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((a, b) => a + b, 0);

  if (totalRevenue > 0 && top3Revenue / totalRevenue > 0.5) {
    recommendations.push({
      priority: 'medium',
      title: 'Reduce Customer Concentration Risk',
      description: 'Over 50% of revenue comes from just 3 customers. Diversify your customer base.',
      action: 'View Analytics',
      icon: 'TrendingUp',
    });
  }

  // Check for inactive customers
  const activeCustomerIds = new Set(invoices.map(inv => inv.customerId));
  const inactiveCustomers = customers.filter(c => !activeCustomerIds.has(c.id)).length;
  
  if (inactiveCustomers > 0) {
    recommendations.push({
      priority: 'low',
      title: 'Re-engage Inactive Customers',
      description: `${inactiveCustomers} customer(s) have no recent invoices. Consider reaching out to them.`,
      action: 'Contact Customers',
      icon: 'Bell',
    });
  }

  return recommendations;
};

/**
 * Get top customers by Customer Lifetime Value (CLV)
 */
export const getTopCLVCustomers = (invoices, limit = 5) => {
  const customerValues = {};

  invoices.forEach(inv => {
    if (!customerValues[inv.customerId]) {
      customerValues[inv.customerId] = {
        customerId: inv.customerId,
        customerName: inv.customerName,
        totalRevenue: 0,
        invoiceCount: 0,
        avgInvoiceValue: 0,
      };
    }
    customerValues[inv.customerId].totalRevenue += inv.totalAmount || 0;
    customerValues[inv.customerId].invoiceCount += 1;
  });

  return Object.values(customerValues)
    .map(c => ({
      ...c,
      avgInvoiceValue: c.invoiceCount > 0 ? c.totalRevenue / c.invoiceCount : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
};

/**
 * Forecast product demand based on historical data
 */
export const forecastProductDemand = (invoices, products) => {
  const productDemand = {};

  // Initialize product demand tracking
  products.forEach(p => {
    productDemand[p.id] = {
      productId: p.id,
      productName: p.name,
      totalQty: 0,
      invoiceCount: 0,
      trend: 'stable',
    };
  });

  // Aggregate invoice line items
  invoices.forEach(inv => {
    if (inv.products && Array.isArray(inv.products)) {
      inv.products.forEach(item => {
        if (productDemand[item.productId]) {
          productDemand[item.productId].totalQty += item.quantity || 0;
          productDemand[item.productId].invoiceCount += 1;
        }
      });
    }
  });

  return Object.values(productDemand)
    .filter(p => p.invoiceCount > 0)
    .map(p => ({
      ...p,
      avgQtyPerInvoice: Math.round(p.totalQty / p.invoiceCount),
      forecastedDemand: Math.round((p.totalQty / invoices.length) * 30), // Monthly forecast
    }))
    .sort((a, b) => b.totalQty - a.totalQty);
};

/**
 * Forecast cash flow for the next months
 */
export const forecastCashFlow = (invoices, options = {}) => {
  const { monthlyExpenses = 0, salaryDate = 1 } = options;
  const now = new Date();
  const forecast = [];

  for (let i = 0; i < 3; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = month.toISOString().slice(0, 7);

    // Calculate expected revenue for the month
    const monthlyRevenue = invoices
      .filter(inv => {
        const invDate = new Date(inv.invoiceDate || inv.createdAt);
        return invDate.getFullYear() === month.getFullYear() && 
               invDate.getMonth() === month.getMonth();
      })
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    const balance = monthlyRevenue - monthlyExpenses;

    forecast.push({
      month: monthKey,
      revenue: Math.round(monthlyRevenue),
      expenses: monthlyExpenses,
      balance: Math.round(balance),
      status: balance >= 0 ? 'positive' : 'negative',
    });
  }

  return forecast;
};
