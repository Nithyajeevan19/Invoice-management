import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * AI-Powered Business Intelligence
 */

export const analyzeCustomerBehavior = (customerName, invoices) => {
  if (!invoices || invoices.length === 0) return { pattern: 'new_customer', insights: [] };
  
  const customerInvoices = invoices.filter(inv => inv.customerName === customerName);
  if (customerInvoices.length === 0) {
    return { pattern: 'new_customer', insights: [] };
  }

  const insights = [];
  const totalSpent = customerInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const avgOrderValue = totalSpent / customerInvoices.length;

  const dates = customerInvoices.map(inv => new Date(inv.date)).sort((a, b) => a - b);
  const firstInvoice = dates[0];
  const lastInvoice = dates[dates.length - 1];
  const daysBetween = Math.floor((lastInvoice - firstInvoice) / (1000 * 60 * 60 * 24));
  const monthsActive = Math.max(1, daysBetween / 30);
  const frequency = customerInvoices.length / monthsActive;

  insights.push(`Orders ${frequency.toFixed(1)}x per month on average`);
  insights.push(`Average order value: ₹${avgOrderValue.toFixed(2)}`);
  insights.push(`Total lifetime value: ₹${totalSpent.toFixed(2)}`);

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
  if (!invoices || invoices.length === 0) return { risk: 'unknown', score: 0, reason: 'No data' };
  
  const customerName = customer.name || customer.customerName;
  const customerInvoices = invoices.filter(inv => inv.customerName === customerName);

  if (customerInvoices.length === 0) {
    return { risk: 'unknown', score: 0, reason: 'No payment history' };
  }

  const overdueCount = customerInvoices.filter(inv => inv.status === 'overdue').length;
  const totalCount = customerInvoices.length;
  const overdueRate = (overdueCount / totalCount) * 100;
  const avgAmount = customerInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0) / totalCount;

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
  let reasons = [];

  if (overdueRate > 50) { riskScore += 40; reasons.push('High overdue rate'); }
  else if (overdueRate > 25) { riskScore += 20; reasons.push('Frequent delays'); }

  if (avgDelayDays > 30) { riskScore += 30; reasons.push('Chronic late payment'); }
  else if (avgDelayDays > 15) { riskScore += 15; reasons.push('Slight payment lag'); }

  if (avgAmount > 100000) { riskScore += 10; reasons.push('Large exposure'); }

  let riskLevel = 'low';
  if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 25) riskLevel = 'medium';

  return {
    risk: riskLevel,
    score: riskScore,
    reason: reasons.join(', ') || 'Healthy history',
    metrics: { overdueRate, avgDelayDays, avgAmount, totalInvoices: totalCount }
  };
};

export const forecastRevenue = (invoices) => {
  if (!invoices || invoices.length < 2) {
    return { forecast: 0, confidence: 'low', trend: 'stable', growth: '0', message: 'Insufficient data' };
  }

  const monthlyRevenue = invoices.reduce((map, inv) => {
    const month = inv.date?.substring(0, 7);
    if (!month) return map;
    map[month] = (map[month] || 0) + (Number(inv.totalAmount) || 0);
    return map;
  }, {});

  const months = Object.keys(monthlyRevenue).sort();
  const revenues = months.map(m => monthlyRevenue[m]);

  if (revenues.length < 2) {
    return { forecast: revenues[0] || 0, confidence: 'low', trend: 'stable', growth: '0', message: 'Limited history' };
  }

  const n = revenues.length;
  const x = Array.from({length: n}, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = revenues.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, i) => a + i * revenues[i], 0);
  const sumXX = x.reduce((a, b) => a + b * b, 0);

  const denominator = (n * sumXX - sumX * sumX);
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const nextMonthValue = Math.max(0, slope * n + intercept);
  const currentAvg = sumY / n;
  const growthRate = currentAvg === 0 ? 0 : ((nextMonthValue - currentAvg) / currentAvg) * 100;

  return {
    forecast: nextMonthValue,
    confidence: n > 5 ? 'high' : 'medium',
    trend: growthRate > 5 ? 'growing' : growthRate < -5 ? 'declining' : 'stable',
    growth: growthRate.toFixed(1),
    message: `Projection based on ${n} months`
  };
};

export const generateRecommendations = ({ invoices = [], products = [], customers = [] }) => {
  const recommendations = [];
  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  
  const overdue = invoices.filter(inv => inv.status === 'overdue');
  const overdueAmount = overdue.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  
  if (overdueAmount > 0) {
    recommendations.push({
      type: 'action',
      priority: overdueAmount > (totalRevenue * 0.2) ? 'high' : 'medium',
      icon: '💰',
      title: 'Aggressive Debt Recovery Needed',
      message: `₹${overdueAmount.toFixed(0)} is currently overdue across ${overdue.length} invoices.`,
      details: [
        'Set up automated SMS reminders',
        'Prioritize high-value overdue accounts',
        'Offer small early-payment discounts'
      ],
      action: 'Run Collection Workflow',
      actionable: true
    });
  }

  const lowStock = products.filter(p => (Number(p.quantity) || 0) < 10 && (Number(p.quantity) || 0) > 0);
  if (lowStock.length > 0) {
    recommendations.push({
      type: 'warning',
      priority: 'high',
      icon: '📦',
      title: 'Stockout Risk Detected',
      message: `${lowStock.length} high-demand products are running low.`,
      details: lowStock.slice(0, 3).map(p => `${p.name}: ${p.quantity} units left`),
      action: 'Generate Purchase Order',
      actionable: true
    });
  }

  const missingGSTIN = customers.filter(c => !c.gstin);
  if (missingGSTIN.length > 0) {
    recommendations.push({
      type: 'insight',
      priority: 'low',
      icon: '⚖️',
      title: 'Compliance Optimization',
      message: `${missingGSTIN.length} customers are missing GSTIN details.`,
      details: ['Affects B2B tax credit eligibility', 'May cause reconciliation issues'],
      action: 'Update Customer Data',
      actionable: true
    });
  }

  return recommendations.sort((a, b) => (a.priority === 'high' ? -1 : 1));
};

export const getAIBusinessAnalysis = async (data) => {
  if (!genAI) return null;
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const stats = {
      totalInvoices: data.invoices?.length || 0,
      totalRevenue: data.invoices?.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0),
      overdueCount: data.invoices?.filter(i => i.status === 'overdue').length || 0,
      customerCount: data.customers?.length || 0,
      topProducts: data.products?.slice(0, 5).map(p => p.name)
    };

    const prompt = `
      As an AI Financial Auditor, analyze these business stats and provide a structured strategic report.
      Stats: ${JSON.stringify(stats)}
      
      Return ONLY JSON:
      {
        "summary": "One sentence overview",
        "healthScore": 0-100,
        "opportunities": ["string"],
        "risks": ["string"],
        "strategicAdvice": "Direct advice for the CEO"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n|\n```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('AI Analysis failed:', error);
    return null;
  }
};

export const forecastCashFlow = (invoices, options = {}) => {
  const { monthlyExpenses = 0 } = options;
  if (!invoices || invoices.length === 0) return { forecasts: [], avgMonthlyRevenue: 0, collectionRate: '0' };

  const monthlyRevenue = invoices.reduce((map, inv) => {
    const month = inv.date?.substring(0, 7);
    if (!month) return map;
    map[month] = (map[month] || 0) + (Number(inv.totalAmount) || 0);
    return map;
  }, {});

  const revenues = Object.values(monthlyRevenue);
  const avgMonthlyRevenue = revenues.length > 0 ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0;
  
  const paid = invoices.filter(i => i.status === 'paid').length;
  const collectionRate = invoices.length > 0 ? paid / invoices.length : 0;

  const forecasts = [1, 2, 3].map(i => {
    const inflow = avgMonthlyRevenue * collectionRate;
    const net = inflow - monthlyExpenses;
    return {
      month: `Month +${i}`,
      expectedInflow: inflow,
      expectedOutflow: monthlyExpenses,
      netCashFlow: net,
      status: net > 0 ? 'positive' : 'negative'
    };
  });

  return { forecasts, avgMonthlyRevenue, collectionRate: (collectionRate * 100).toFixed(0) };
};

export const getTopCLVCustomers = (invoices, limit = 5) => {
  if (!invoices || invoices.length === 0) return [];
  const customerRevenue = invoices.reduce((map, inv) => {
    map[inv.customerName] = (map[inv.customerName] || 0) + (Number(inv.totalAmount) || 0);
    return map;
  }, {});

  return Object.entries(customerRevenue)
    .map(([name, value]) => ({ customerName: name, predictedCLV: value }))
    .sort((a, b) => b.predictedCLV - a.predictedCLV)
    .slice(0, limit);
};

export const detectAnomalies = (invoices) => {
  if (!invoices || invoices.length < 5) return [];

  const amounts = invoices.map(inv => Number(inv.totalAmount) || 0);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / amounts.length);

  return invoices.filter(inv => {
    const zScore = Math.abs((Number(inv.totalAmount) - avg) / (stdDev || 1));
    return zScore > 3;
  }).map(inv => ({
    invoice: inv.serialNumber,
    type: 'statistical_anomaly',
    message: `Amount ₹${inv.totalAmount} is significantly different from average.`
  }));
};

export const calculateCustomerLifetimeValue = (customerName, invoices) => {
  if (!invoices || invoices.length === 0) return { predictedCLV: 0, totalSpent: 0, avgOrderValue: 0, monthlyValue: 0, retentionRate: 0 };
  const customerInvoices = invoices.filter(inv => inv.customerName === customerName);
  const totalSpent = customerInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const avgOrderValue = totalSpent / (customerInvoices.length || 1);
  return {
    predictedCLV: totalSpent * 1.5,
    totalSpent,
    avgOrderValue,
    monthlyValue: totalSpent / 12,
    retentionRate: 85
  };
};

export const forecastProductDemand = (invoices, products) => {
  return (products || []).map(p => ({
    productName: p.name,
    currentStock: p.quantity,
    forecast: (Number(p.quantity) || 0) * 1.2,
    recommendedStock: (Number(p.quantity) || 0) * 1.5,
    trend: 'stable'
  })).slice(0, 5);
};
