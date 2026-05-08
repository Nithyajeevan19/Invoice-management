/**
 * Normalization utilities for invoice data
 */

export const normalizeDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try manual parsing for common formats if Date fails
      const parts = dateStr.split(/[-/.]/);
      if (parts.length === 3) {
        // Assume DD-MM-YYYY or YYYY-MM-DD
        if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return '';
    }
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export const normalizeNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  
  const cleaned = String(value)
    .replace(/[^\d.-]/g, '') // Remove everything except digits, dots, and hyphens
    .replace(/(?!^)-/g, ''); // Remove hyphens not at the start
    
  const num = parseFloat(cleaned);
  return isFinite(num) ? num : 0;
};

export const normalizeCurrency = (currencyStr) => {
  if (!currencyStr) return 'INR';
  const upper = currencyStr.toUpperCase().trim();
  if (upper.includes('USD') || upper === '$') return 'USD';
  if (upper.includes('EUR') || upper === '€') return 'EUR';
  if (upper.includes('GBP') || upper === '£') return 'GBP';
  return 'INR';
};

export const normalizeGSTIN = (gstin) => {
  if (!gstin) return '';
  return gstin.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
};

export const normalizeEmail = (email) => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

export const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.trim().replace(/[^\d+]/g, '');
};
