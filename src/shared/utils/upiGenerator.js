/**
 * Validates UPI ID format
 * UPI ID format: identifier@bankname
 * Valid examples: merchant@paytm, user@okhdfcbank, business@ybl
 */
export const validateUPIId = (upiId) => {
  const upiRegex = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z0-9]{3,}$/;
  return upiRegex.test(upiId);
};

/**
 * Generates UPI payment string from invoice data
 * Format: upi://pay?pa=<upi>&pn=<name>&am=<amount>&tn=<description>&tr=<reference>
 */
export const generateInvoiceUPI = (invoice, merchantInfo) => {
  // Get merchant UPI ID and name from localStorage or merchantInfo
  const merchantUPI = localStorage.getItem('merchant_upi_id') || merchantInfo?.upiId || 'merchant@paytm';
  const merchantName = (localStorage.getItem('merchant_name') || merchantInfo?.name || 'Merchant').replace(/\s+/g, '%20');
  
  // Extract amount from invoice
  const amount = invoice?.total || invoice?.grandTotal || 0;
  
  // Create description
  const description = `Invoice%20${invoice?.serialNumber || invoice?.id || 'Payment'}`;
  
  // Create transaction reference
  const reference = `INV${invoice?.id || invoice?.serialNumber || Date.now()}`;
  
  // Construct UPI string
  const upiString = `upi://pay?pa=${merchantUPI}&pn=${merchantName}&am=${amount}&tn=${description}&tr=${reference}`;
  
  return upiString;
};

/**
 * Generates a QR-friendly UPI string
 * Some QR generators prefer simplified format
 */
export const generateSimpleUPIString = (upiId, amount, description = 'Payment') => {
  if (!validateUPIId(upiId)) {
    throw new Error('Invalid UPI ID format');
  }
  
  const encodedDescription = description.replace(/\s+/g, '%20');
  return `upi://pay?pa=${upiId}&am=${amount}&tn=${encodedDescription}`;
};

/**
 * Parses UPI string back to components
 */
export const parseUPIString = (upiString) => {
  const url = new URL(upiString);
  
  return {
    upiId: url.searchParams.get('pa'),
    merchantName: decodeURIComponent(url.searchParams.get('pn') || ''),
    amount: parseFloat(url.searchParams.get('am') || 0),
    description: decodeURIComponent(url.searchParams.get('tn') || ''),
    transactionRef: url.searchParams.get('tr'),
  };
};
