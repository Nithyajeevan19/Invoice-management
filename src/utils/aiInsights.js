/**
 * AI-Powered Business Intelligence
 * Analyzes patterns and provides smart insights
 */

/**
 * Predict payment delay risk for a customer
 * @param {Object} customer - Customer data
 * @param {Array} invoices - All customer invoices
 * @returns {Object} Risk assessment
 */


/**
 * Generate revenue forecast for next month
 * @param {Array} invoices - Historical invoices
 * @returns {Object} Forecast data

/**
 * Detect anomalies in transactions
 * @param {Array} invoices - All invoices
 * @returns {Array} Anomalies found
 */

/**
 * Generate smart recommendations
 * @param {Object} data - All business data
 * @returns {Array} Actionable recommendations
 */

/**
 * Analyze customer behavior patterns
 * @param {string} customerName - Customer name
 * @param {Array} invoices - All invoices
 * @returns {Object} Behavior analysis
 */
export const analyzeCustomerBehavior = (customerName, invoices) => {
  const customerInvoices = invoices.filter(inv => inv.customerName === customerName);

  if (customerInvoices.length === 0) {
    return { pattern: 'new_customer', insights: [] };
  }

  const insights = [];
  const totalSpent = customerInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const avgOrderValue = totalSpent / customerInvoices.length;

  // Frequency
  const firstInvoice = new Date(customerInvoices[0].date);
  const lastInvoice = new Date(customerInvoices[customerInvoices.length - 1].date);
  const daysBetween = Math.floor((lastInvoice - firstInvoice) / (1000 * 60 * 60 * 24));
  const frequency = daysBetween > 0 ? customerInvoices.length / (daysBetween / 30) : 0;

  insights.push(`Orders ${frequency.toFixed(1)}x per month on average`);
  insights.push(`Average order value: ₹${avgOrderValue.toFixed(2)}`);
  insights.push(`Total lifetime value: ₹${totalSpent.toFixed(2)}`);

  // Pattern
  let pattern = 'regular';
  if (frequency > 4) pattern = 'frequent';
  else if (frequency < 1) pattern = 'occasional';

  return {
    pattern,
    insights,
    totalSpent,
    avgOrderValue,
    frequency,
    totalOrders: customerInvoices.length,
  };
};




export const predictPaymentDelay = (customer, invoices) => {
  const customerInvoices = invoices.filter(inv => 
    inv.customerName === customer.name || inv.customerName === customer.customerName
  );

  if (customerInvoices.length === 0) {
    return { risk: 'unknown', score: 0, reason: 'No payment history' };
  }

  const overdueCount = customerInvoices.filter(inv => inv.status === 'overdue').length;
  const totalCount = customerInvoices.length;
  const overdueRate = (overdueCount / totalCount) * 100;
  const avgAmount = customerInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) / totalCount;

  const paidInvoices = customerInvoices.filter(inv => inv.status === 'paid');
  let avgDelayDays = 0;
  if (paidInvoices.length > 0) {
    const delays = paidInvoices.map(inv => {
      const invoiceDate = new Date(inv.date);
      const paidDate = new Date();
      return Math.floor((paidDate - invoiceDate) / (1000 * 60 * 60 * 24));
    });
    avgDelayDays = delays.reduce((sum, d) => sum + d, 0) / delays.length;
  }

  let riskScore = 0;
  let riskLevel = 'low';
  let reasons = [];

  if (overdueRate > 50) {
    riskScore += 40;
    reasons.push(`${overdueRate.toFixed(0)}% overdue rate`);
  } else if (overdueRate > 25) {
    riskScore += 20;
    reasons.push(`${overdueRate.toFixed(0)}% overdue rate`);
  }

  if (avgDelayDays > 30) {
    riskScore += 30;
    reasons.push(`Avg ${avgDelayDays.toFixed(0)} days delay`);
  } else if (avgDelayDays > 15) {
    riskScore += 15;
    reasons.push(`Avg ${avgDelayDays.toFixed(0)} days delay`);
  }

  if (avgAmount > 50000) {
    riskScore += 10;
    reasons.push('High value transactions');
  }

  if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 25) riskLevel = 'medium';
  else riskLevel = 'low';

  return {
    risk: riskLevel,
    score: riskScore,
    reason: reasons.join(', ') || 'Good payment history',
    metrics: { overdueRate, avgDelayDays, avgAmount, totalInvoices: totalCount }
  };
};

export const forecastRevenue = (invoices) => {
  if (invoices.length < 3) {
    return {
      forecast: 0,
      confidence: 'low',
      trend: 'insufficient_data',
      message: 'Need more historical data for accurate forecast'
    };
  }

  const monthlyRevenue = invoices.reduce((map, inv) => {
    const month = inv.date?.substring(0, 7) || 'unknown';
    map[month] = (map[month] || 0) + (inv.totalAmount || 0);
    return map;
  }, {});

  const months = Object.keys(monthlyRevenue).sort();
  const revenues = months.map(m => monthlyRevenue[m]);

  if (revenues.length < 2) {
    return {
      forecast: revenues[0] || 0,
      confidence: 'low',
      trend: 'stable',
      message: 'Limited data, using current month average'
    };
  }

  const n = revenues.length;
  const sumX = revenues.reduce((sum, _, i) => sum + i, 0);
  const sumY = revenues.reduce((sum, val) => sum + val, 0);
  const sumXY = revenues.reduce((sum, val, i) => sum + (i * val), 0);
  const sumX2 = revenues.reduce((sum, _, i) => sum + (i * i), 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const forecast = slope * n + intercept;
  const avgRevenue = sumY / n;
  const growth = ((forecast - avgRevenue) / avgRevenue) * 100;

  let trend = 'stable';
  if (growth > 10) trend = 'growing';
  else if (growth < -10) trend = 'declining';

  let confidence = 'medium';
  if (n > 6) confidence = 'high';
  else if (n < 3) confidence = 'low';

  return {
    forecast: Math.max(0, forecast),
    confidence,
    trend,
    growth: growth.toFixed(1),
    message: `Based on ${n} months of data`,
    monthlyAverage: avgRevenue,
  };
};

export const detectAnomalies = (invoices) => {
  if (invoices.length < 10) return [];

  const amounts = invoices.map(inv => inv.totalAmount || 0);
  const avg = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  const anomalies = [];

  invoices.forEach(inv => {
    const amount = inv.totalAmount || 0;
    const zScore = Math.abs((amount - avg) / stdDev);

    if (zScore > 2.5 && amount > avg) {
      anomalies.push({
        invoice: inv.serialNumber,
        type: 'high_value',
        severity: 'medium',
        message: `Unusually high amount: ₹${amount.toFixed(2)} (${zScore.toFixed(1)}σ above average)`,
        amount,
      });
    }

    if (zScore > 2.5 && amount < avg && amount > 0) {
      anomalies.push({
        invoice: inv.serialNumber,
        type: 'low_value',
        severity: 'low',
        message: `Unusually low amount: ₹${amount.toFixed(2)} (${zScore.toFixed(1)}σ below average)`,
        amount,
      });
    }
  });

  const dateAmountMap = {};
  invoices.forEach(inv => {
    const key = `${inv.date}_${inv.totalAmount}`;
    if (dateAmountMap[key]) {
      anomalies.push({
        invoice: inv.serialNumber,
        type: 'possible_duplicate',
        severity: 'high',
        message: `Possible duplicate: Same amount (₹${inv.totalAmount?.toFixed(2)}) on ${inv.date}`,
        amount: inv.totalAmount,
      });
    }
    dateAmountMap[key] = true;
  });

  return anomalies.slice(0, 10);
};

export const generateRecommendations = ({ invoices, customers, products, payments }) => {
  const recommendations = [];

  // 1. LOW COLLECTION RATE (Most Critical)
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft');
  
  const collectionRate = invoices.length > 0 ? (paidInvoices.length / invoices.length * 100).toFixed(1) : 0;
  
  if (collectionRate < 70) {
    const unpaidAmount = [...overdueInvoices, ...pendingInvoices].reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    recommendations.push({
      type: 'action',
      priority: 'high',
      icon: '💰',
      title: 'Low collection rate',
      message: `Only ${collectionRate}% invoices paid (${paidInvoices.length}/${invoices.length}). ₹${unpaidAmount.toFixed(0)} pending collection.`,
      details: [
        `${overdueInvoices.length} invoices overdue`,
        `${pendingInvoices.length} invoices awaiting payment`,
        `Average days to payment: ${calculateAvgPaymentDays(paidInvoices)} days`
      ],
      action: 'Setup Automated Reminders',
      actionable: true,
    });
  }

  // 2. OVERDUE INVOICES (Critical)
  if (overdueInvoices.length > 0) {
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const criticalOverdue = overdueInvoices.filter(inv => {
      const daysOverdue = Math.floor((new Date() - new Date(inv.date)) / (1000 * 60 * 60 * 24));
      return daysOverdue > 30;
    });

    recommendations.push({
      type: 'action',
      priority: 'high',
      icon: '⚠️',
      title: 'Overdue invoices require immediate action',
      message: `${overdueInvoices.length} invoices overdue (₹${overdueAmount.toFixed(0)}). ${criticalOverdue.length} are critical (>30 days).`,
      details: [
        `Total overdue amount: ₹${overdueAmount.toFixed(2)}`,
        `Critical invoices: ${criticalOverdue.length}`,
        `Recommended: Send payment reminders today`
      ],
      action: 'Send Payment Reminders',
      actionable: true,
    });
  }

  // 3. LOW STOCK ALERT (Medium)
  const lowStockProducts = products.filter(p => {
    const stock = p.quantity || 0;
    return stock > 0 && stock < 10;
  });
  
  const outOfStockProducts = products.filter(p => (p.quantity || 0) === 0);

  if (lowStockProducts.length > 0 || outOfStockProducts.length > 0) {
    recommendations.push({
      type: 'warning',
      priority: 'medium',
      icon: '📦',
      title: 'Low stock alert',
      message: `${lowStockProducts.length} products have low inventory. ${outOfStockProducts.length} products are out of stock.`,
      details: [
        `Low stock (<10 units): ${lowStockProducts.length} products`,
        `Out of stock: ${outOfStockProducts.length} products`,
        `Action: Review and reorder inventory`
      ],
      action: 'View Products',
      actionable: true,
    });
  }

  // 4. REVENUE TREND (Insight)
  const forecast = forecastRevenue(invoices);
  if (forecast.trend === 'growing' && parseFloat(forecast.growth) > 15) {
    recommendations.push({
      type: 'insight',
      priority: 'low',
      icon: '📈',
      title: 'Strong revenue growth detected',
      message: `Revenue growing at ${forecast.growth}% rate. Great momentum!`,
      details: [
        `Forecasted next month: ₹${forecast.forecast.toFixed(0)}`,
        `Growth rate: +${forecast.growth}%`,
        `Recommendation: Scale operations, increase inventory`
      ],
      action: null,
      actionable: false,
    });
  } else if (forecast.trend === 'declining' && parseFloat(forecast.growth) < -10) {
    recommendations.push({
      type: 'warning',
      priority: 'high',
      icon: '📉',
      title: 'Revenue declining - action needed',
      message: `Revenue declining at ${forecast.growth}% rate. Review strategy immediately.`,
      details: [
        `Forecasted next month: ₹${forecast.forecast.toFixed(0)}`,
        `Decline rate: ${forecast.growth}%`,
        `Actions: Review pricing, customer engagement, product mix`
      ],
      action: 'View Analytics',
      actionable: true,
    });
  }

  // 5. TOP CUSTOMER OPPORTUNITY (Medium)
  const customerRevenue = invoices.reduce((map, inv) => {
    const name = inv.customerName || 'Unknown';
    if (name !== 'Unknown') {
      map[name] = (map[name] || 0) + (inv.totalAmount || 0);
    }
    return map;
  }, {});

  const sortedCustomers = Object.entries(customerRevenue).sort((a, b) => b[1] - a[1]);
  const topCustomer = sortedCustomers[0];
  
  if (topCustomer && sortedCustomers.length > 1) {
    const topCustomerShare = (topCustomer[1] / invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)) * 100;
    
    recommendations.push({
      type: 'insight',
      priority: 'medium',
      icon: '⭐',
      title: 'Top customer identified',
      message: `${topCustomer[0]} contributed ₹${topCustomer[1].toFixed(0)} (${topCustomerShare.toFixed(1)}% of revenue).`,
      details: [
        `Revenue share: ${topCustomerShare.toFixed(1)}%`,
        `Total contribution: ₹${topCustomer[1].toFixed(2)}`,
        `Recommendation: VIP treatment, loyalty program, bulk discounts`
      ],
      action: null,
      actionable: false,
    });
  }

  // 6. SEASONAL PATTERN (Insight)
  const monthlyRevenue = invoices.reduce((map, inv) => {
    const month = inv.date?.substring(5, 7); // MM
    if (month) {
      map[month] = (map[month] || 0) + (inv.totalAmount || 0);
    }
    return map;
  }, {});

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthStr = String(currentMonth).padStart(2, '0');
  const lastMonthStr = String(currentMonth === 1 ? 12 : currentMonth - 1).padStart(2, '0');
  
  if (monthlyRevenue[currentMonthStr] && monthlyRevenue[lastMonthStr]) {
    const monthGrowth = ((monthlyRevenue[currentMonthStr] - monthlyRevenue[lastMonthStr]) / monthlyRevenue[lastMonthStr]) * 100;
    
    if (Math.abs(monthGrowth) > 20) {
      recommendations.push({
        type: 'insight',
        priority: 'low',
        icon: '📊',
        title: monthGrowth > 0 ? 'Strong monthly growth' : 'Monthly revenue drop',
        message: `This month ${monthGrowth > 0 ? 'up' : 'down'} ${Math.abs(monthGrowth).toFixed(1)}% vs last month.`,
        details: [
          `Current month: ₹${monthlyRevenue[currentMonthStr].toFixed(0)}`,
          `Last month: ₹${monthlyRevenue[lastMonthStr].toFixed(0)}`,
          `Change: ${monthGrowth > 0 ? '+' : ''}${monthGrowth.toFixed(1)}%`
        ],
        action: null,
        actionable: false,
      });
    }
  }

  // 7. HIGH-VALUE CUSTOMERS AT RISK (Critical)
  const highValueCustomers = sortedCustomers.filter(([name, revenue]) => revenue > 50000);
  const riskyHighValue = highValueCustomers.filter(([name]) => {
    const customerInvoices = invoices.filter(inv => inv.customerName === name);
    const overdueCount = customerInvoices.filter(inv => inv.status === 'overdue').length;
    return overdueCount > 0;
  });

  if (riskyHighValue.length > 0) {
    recommendations.push({
      type: 'action',
      priority: 'high',
      icon: '🚨',
      title: 'High-value customers at risk',
      message: `${riskyHighValue.length} major customers have overdue payments.`,
      details: riskyHighValue.slice(0, 3).map(([name, revenue]) => 
        `${name}: ₹${revenue.toFixed(0)}`
      ),
      action: 'Contact Customers',
      actionable: true,
    });
  }

  // 8. CASH FLOW WARNING
  const totalPending = [...overdueInvoices, ...pendingInvoices].reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const pendingRate = totalRevenue > 0 ? (totalPending / totalRevenue) * 100 : 0;

  if (pendingRate > 40) {
    recommendations.push({
      type: 'warning',
      priority: 'high',
      icon: '💸',
      title: 'Cash flow concern',
      message: `₹${totalPending.toFixed(0)} (${pendingRate.toFixed(0)}% of revenue) is pending collection.`,
      details: [
        `Total pending: ₹${totalPending.toFixed(2)}`,
        `Percentage of revenue: ${pendingRate.toFixed(1)}%`,
        `Risk: Cash flow shortage`
      ],
      action: 'Aggressive Follow-ups',
      actionable: true,
    });
  }

  return recommendations.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority];
  });
};

// Helper function
const calculateAvgPaymentDays = (paidInvoices) => {
  if (paidInvoices.length === 0) return 0;
  
  const delays = paidInvoices.map(inv => {
    const invoiceDate = new Date(inv.date);
    const paidDate = new Date(); // Would be actual payment date
    return Math.floor((paidDate - invoiceDate) / (1000 * 60 * 60 * 24));
  });
  
  return Math.floor(delays.reduce((sum, d) => sum + d, 0) / delays.length);
};

// ============ NEW ENHANCED FUNCTIONS ============

/**
 * Calculate Customer Lifetime Value (CLV)
 * @param {string} customerName - Customer name
 * @param {Array} invoices - All invoices
 * @returns {Object} CLV prediction
 */
export const calculateCustomerLifetimeValue = (customerName, invoices) => {
  const customerInvoices = invoices
    .filter(inv => inv.customerName === customerName)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (customerInvoices.length === 0) {
    return {
      totalSpent: 0,
      avgOrderValue: 0,
      orderFrequency: 0,
      predictedCLV: 0,
      monthlyValue: 0,
      retentionRate: 0,
      message: 'No purchase history',
    };
  }

  // Calculate metrics
  const totalSpent = customerInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const avgOrderValue = totalSpent / customerInvoices.length;

  // Calculate frequency (orders per month)
  const firstOrder = new Date(customerInvoices[0].date);
  const lastOrder = new Date(customerInvoices[customerInvoices.length - 1].date);
  const monthsActive = Math.max(1, (lastOrder - firstOrder) / (1000 * 60 * 60 * 24 * 30));
  const orderFrequency = customerInvoices.length / monthsActive;

  // Monthly value
  const monthlyValue = avgOrderValue * orderFrequency;

  // Estimate retention (simple: if ordered in last 60 days = active)
  const daysSinceLastOrder = (new Date() - lastOrder) / (1000 * 60 * 60 * 24);
  const retentionRate = daysSinceLastOrder < 60 ? 0.85 : 0.5;

  // Predicted CLV (24 months projection)
  const predictedCLV = monthlyValue * 24 * retentionRate;

  return {
    totalSpent,
    avgOrderValue,
    orderFrequency: orderFrequency.toFixed(2),
    predictedCLV,
    monthlyValue,
    retentionRate: (retentionRate * 100).toFixed(0),
    activeMonths: monthsActive.toFixed(1),
    totalOrders: customerInvoices.length,
    message: `Based on ${customerInvoices.length} orders over ${monthsActive.toFixed(1)} months`,
  };
};

/**
 * Forecast product demand for next month
 * @param {Array} invoices - All invoices
 * @param {Array} products - All products
 * @returns {Array} Product demand forecasts
 */
export const forecastProductDemand = (invoices, products) => {
  // Aggregate product sales by month
  const productSalesByMonth = {};

  invoices.forEach(inv => {
    const month = inv.date?.substring(0, 7);
    if (!month) return;

    (inv.products || []).forEach(p => {
      const productName = p.productName || p.name || 'Unknown';
      if (!productSalesByMonth[productName]) {
        productSalesByMonth[productName] = {};
      }
      productSalesByMonth[productName][month] = 
        (productSalesByMonth[productName][month] || 0) + (p.quantity || 0);
    });
  });

  // Forecast for each product
  const forecasts = Object.entries(productSalesByMonth).map(([productName, monthlyData]) => {
    const months = Object.keys(monthlyData).sort();
    const quantities = months.map(m => monthlyData[m]);

    if (quantities.length < 2) {
      return {
        productName,
        currentAvg: quantities[0] || 0,
        forecast: quantities[0] || 0,
        trend: 'stable',
        confidence: 'low',
        message: 'Limited data',
      };
    }

    // Simple moving average with trend
    const recent3Months = quantities.slice(-3);
    const avgRecent = recent3Months.reduce((sum, q) => sum + q, 0) / recent3Months.length;
    
    const older3Months = quantities.slice(-6, -3);
    const avgOlder = older3Months.length > 0 
      ? older3Months.reduce((sum, q) => sum + q, 0) / older3Months.length 
      : avgRecent;

    const trendFactor = avgRecent / (avgOlder || 1);
    const forecast = Math.round(avgRecent * trendFactor);

    let trend = 'stable';
    if (trendFactor > 1.1) trend = 'increasing';
    else if (trendFactor < 0.9) trend = 'decreasing';

    const confidence = quantities.length > 5 ? 'high' : 'medium';

    // Find product details
    const productDetails = products.find(p => 
      (p.name || p.productName) === productName
    ) || {};

    const currentStock = productDetails.quantity || 0;
    const stockoutRisk = forecast > currentStock ? 'high' : 'low';

    return {
      productName,
      currentAvg: avgRecent.toFixed(1),
      forecast,
      trend,
      confidence,
      currentStock,
      stockoutRisk,
      recommendedStock: Math.ceil(forecast * 1.2), // 20% buffer
      message: `Based on ${quantities.length} months`,
    };
  });

  return forecasts
    .sort((a, b) => b.forecast - a.forecast)
    .slice(0, 10); // Top 10
};

/**
 * Forecast cash flow for next 3 months
 * @param {Array} invoices - All invoices
 * @param {Object} options - Additional parameters
 * @returns {Object} Cash flow forecast
 */
export const forecastCashFlow = (invoices, options = {}) => {
  const { monthlyExpenses = 0, salaryDate = 1 } = options;

  // Calculate average monthly inflow
  const monthlyRevenue = invoices.reduce((map, inv) => {
    const month = inv.date?.substring(0, 7);
    if (!month) return map;
    map[month] = (map[month] || 0) + (inv.totalAmount || 0);
    return map;
  }, {});

  const months = Object.keys(monthlyRevenue).sort();
  const revenues = months.map(m => monthlyRevenue[m]);
  const avgMonthlyRevenue = revenues.length > 0 
    ? revenues.reduce((sum, r) => sum + r, 0) / revenues.length 
    : 0;

  // Payment collection rate
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const collectionRate = invoices.length > 0 
    ? paidInvoices.length / invoices.length 
    : 0.7; // Default 70%

  // Generate next 3 months forecast
  const today = new Date();
  const forecasts = [];

  for (let i = 1; i <= 3; i++) {
    const forecastDate = new Date(today);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    const month = forecastDate.toISOString().substring(0, 7);
    const monthName = forecastDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Expected inflow (with collection rate)
    const expectedInflow = avgMonthlyRevenue * collectionRate;

    // Expected outflow
    const expectedOutflow = monthlyExpenses;

    // Net cash flow
    const netCashFlow = expectedInflow - expectedOutflow;

    // Risk dates (e.g., salary day with low receipts)
    const riskDates = [];
    if (netCashFlow < 0) {
      riskDates.push({
        date: `${month}-${salaryDate}`,
        description: 'Negative cash flow expected',
        amount: Math.abs(netCashFlow),
      });
    }

    forecasts.push({
      month,
      monthName,
      expectedInflow,
      expectedOutflow,
      netCashFlow,
      collectionRate: (collectionRate * 100).toFixed(0),
      riskDates,
      status: netCashFlow > 0 ? 'positive' : 'negative',
    });
  }

  return {
    forecasts,
    avgMonthlyRevenue,
    collectionRate: (collectionRate * 100).toFixed(0),
    message: `Based on ${revenues.length} months of data`,
  };
};

/**
 * Get top CLV customers
 * @param {Array} invoices - All invoices
 * @param {number} limit - Number of customers to return
 * @returns {Array} Top customers by CLV
 */
export const getTopCLVCustomers = (invoices, limit = 5) => {
  const customerNames = [...new Set(invoices.map(inv => inv.customerName))];
  
  const clvData = customerNames
    .map(name => ({
      customerName: name,
      ...calculateCustomerLifetimeValue(name, invoices),
    }))
    .filter(c => c.totalOrders > 0)
    .sort((a, b) => b.predictedCLV - a.predictedCLV)
    .slice(0, limit);

  return clvData;
};
