/**
 * Generate UPI Payment String
 * Based on UPI Deep Link Specification
 * https://www.npci.org.in/what-we-do/upi/upi-specifications
 */

/**
 * Generate UPI payment URL
 * @param {Object} params - UPI payment parameters
 * @param {string} params.vpa - UPI ID (e.g., merchant@paytm)
 * @param {string} params.name - Payee name
 * @param {number} params.amount - Payment amount
 * @param {string} params.transactionNote - Transaction note
 * @param {string} params.transactionRef - Transaction reference/invoice number
 * @returns {string} UPI payment URL
 */
export const generateUPIString = ({
  vpa,
  name,
  amount,
  transactionNote = '',
  transactionRef = '',
}) => {
  // UPI URL format: upi://pay?pa=<VPA>&pn=<Name>&am=<Amount>&tn=<Note>&tr=<Ref>
  
  const params = new URLSearchParams({
    pa: vpa, // Payee address (UPI ID)
    pn: name, // Payee name
    am: amount.toFixed(2), // Amount
    cu: 'INR', // Currency
    tn: transactionNote || `Payment for Invoice ${transactionRef}`, // Transaction note
  });

  // Add transaction reference if provided
  if (transactionRef) {
    params.append('tr', transactionRef);
  }

  return `upi://pay?${params.toString()}`;
};

/**
 * Generate UPI QR code data for invoice
 * @param {Object} invoice - Invoice data
 * @param {Object} merchantInfo - Merchant UPI info
 * @returns {string} UPI payment string
 */
export const generateInvoiceUPI = (invoice, merchantInfo) => {
  return generateUPIString({
    vpa: merchantInfo.upiId,
    name: merchantInfo.name,
    amount: invoice.totalAmount,
    transactionNote: `Payment for Invoice #${invoice.serialNumber}`,
    transactionRef: invoice.serialNumber,
  });
};

/**
 * Validate UPI ID format
 * @param {string} upiId - UPI ID to validate
 * @returns {boolean} Is valid
 */
export const validateUPIId = (upiId) => {
  // UPI ID format: username@bankname
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  return upiRegex.test(upiId);
};

/**
 * Popular UPI apps and their package names (for deep linking)
 */
export const UPI_APPS = {
  PAYTM: 'net.one97.paytm',
  PHONEPE: 'com.phonepe.app',
  GPAY: 'com.google.android.apps.nbu.paisa.user',
  BHIM: 'in.org.npci.upiapp',
  WHATSAPP: 'com.whatsapp',
};
