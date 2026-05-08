/**
 * Validation engine for extracted invoice data
 */

export const validateInvoiceMath = (invoice) => {
  const errors = [];
  const warnings = [];

  const totalAmount = invoice.totalAmount || 0;
  const taxAmount = invoice.taxAmount || 0;
  
  // Calculate expected total from products
  const productTotal = (invoice.products || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  
  if (productTotal > 0 && Math.abs(productTotal - totalAmount) > 1) {
    warnings.push(`Sum of items (₹${productTotal.toFixed(2)}) doesn't match total (₹${totalAmount.toFixed(2)})`);
  }

  if (totalAmount < 0) {
    errors.push('Total amount cannot be negative');
  }

  if (totalAmount === 0 && (invoice.products || []).length > 0) {
    warnings.push('Total amount is zero but items were found');
  }

  return { errors, warnings };
};

export const validateRequiredFields = (data) => {
  const missing = [];
  
  if (!data.invoices || data.invoices.length === 0) {
    missing.push('Invoice details');
    return missing;
  }

  const inv = data.invoices[0];
  if (!inv.serialNumber) missing.push('Invoice number');
  if (!inv.date) missing.push('Invoice date');
  if (!inv.customerName) missing.push('Customer name');
  if (inv.totalAmount === 0) missing.push('Total amount');

  return missing;
};

export const checkDuplicates = (newInvoice, existingInvoices) => {
  return existingInvoices.some(inv => 
    inv.serialNumber === newInvoice.serialNumber && 
    inv.customerName === newInvoice.customerName
  );
};

export const validateTaxConsistency = (invoice) => {
  const warnings = [];
  const taxAmount = invoice.taxAmount || 0;
  
  const calculatedTax = (invoice.products || []).reduce((sum, p) => {
    const qty = p.quantity || 0;
    const price = p.unitPrice || 0;
    const taxRate = p.tax || 0;
    return sum + (qty * price * (taxRate / 100));
  }, 0);

  if (calculatedTax > 0 && Math.abs(calculatedTax - taxAmount) > 1) {
    warnings.push(`Calculated tax (₹${calculatedTax.toFixed(2)}) differs from extracted tax (₹${taxAmount.toFixed(2)})`);
  }

  return warnings;
};
