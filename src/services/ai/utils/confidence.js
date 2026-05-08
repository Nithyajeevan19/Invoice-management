/**
 * Confidence scoring logic for AI extraction
 */

export const calculateConfidenceScore = (data, rawContent) => {
  let score = 0;
  const weights = {
    serialNumber: 15,
    date: 10,
    customerName: 15,
    totalAmount: 20,
    products: 20,
    gstin: 10,
    email: 10
  };

  const invoice = data.invoices?.[0] || {};
  const customer = data.customers?.[0] || {};

  // Check field completeness
  if (invoice.serialNumber) score += weights.serialNumber;
  if (invoice.date) score += weights.date;
  if (invoice.customerName) score += weights.customerName;
  if (invoice.totalAmount > 0) score += weights.totalAmount;
  if (invoice.products?.length > 0) score += weights.products;
  if (customer.gstin) score += weights.gstin;
  if (customer.email) score += weights.email;

  // Penalty for math inconsistencies
  const productTotal = (invoice.products || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  if (productTotal > 0 && Math.abs(productTotal - invoice.totalAmount) > 2) {
    score -= 15;
  }

  // Bonus for OCR match (if we have raw content to compare)
  if (rawContent && invoice.serialNumber) {
    if (rawContent.includes(invoice.serialNumber)) {
      score += 5;
    }
  }

  // Ensure score is between 0 and 100
  const finalScore = Math.max(0, Math.min(100, score));
  
  let status = 'low';
  if (finalScore >= 85) status = 'high';
  else if (finalScore >= 60) status = 'medium';

  return {
    score: finalScore,
    status,
    warnings: [], // Can be populated based on specific logic
  };
};
