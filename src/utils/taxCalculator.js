// Indian States with GST codes
export const INDIAN_STATES = {
  'ANDHRA PRADESH': '37',
  'ARUNACHAL PRADESH': '12',
  'ASSAM': '18',
  'BIHAR': '10',
  'CHHATTISGARH': '22',
  'GOA': '30',
  'GUJARAT': '24',
  'HARYANA': '06',
  'HIMACHAL PRADESH': '02',
  'JHARKHAND': '20',
  'KARNATAKA': '29',
  'KERALA': '32',
  'MADHYA PRADESH': '23',
  'MAHARASHTRA': '27',
  'MANIPUR': '14',
  'MEGHALAYA': '17',
  'MIZORAM': '15',
  'NAGALAND': '13',
  'ODISHA': '21',
  'PUNJAB': '03',
  'RAJASTHAN': '08',
  'SIKKIM': '11',
  'TAMIL NADU': '33',
  'TELANGANA': '36',
  'TRIPURA': '16',
  'UTTAR PRADESH': '09',
  'UTTARAKHAND': '05',
  'WEST BENGAL': '19',
  'DELHI': '07',
  'JAMMU AND KASHMIR': '01',
  'LADAKH': '38',
  'PUDUCHERRY': '34',
  'CHANDIGARH': '04',
  'ANDAMAN AND NICOBAR': '35',
  'DADRA AND NAGAR HAVELI': '26',
  'DAMAN AND DIU': '25',
  'LAKSHADWEEP': '31',
};

/**
 * Calculate GST breakdown
 * @param {number} taxableAmount - Amount before tax
 * @param {number} taxRate - Tax percentage (e.g., 18 for 18%)
 * @param {string} sellerState - Seller's state name
 * @param {string} buyerState - Buyer's state name
 * @returns {object} Tax breakdown
 */
export const calculateGST = (taxableAmount, taxRate, sellerState, buyerState) => {
  const normalizedSellerState = sellerState?.toUpperCase().trim();
  const normalizedBuyerState = buyerState?.toUpperCase().trim();
  
  const isSameState = normalizedSellerState === normalizedBuyerState;
  const taxAmount = (taxableAmount * taxRate) / 100;

  if (isSameState) {
    // Intra-state: CGST + SGST
    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;
    return {
      type: 'INTRA_STATE',
      cgst: parseFloat(cgst.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
      igst: 0,
      totalTax: parseFloat(taxAmount.toFixed(2)),
      cgstRate: taxRate / 2,
      sgstRate: taxRate / 2,
      igstRate: 0,
    };
  } else {
    // Inter-state: IGST
    return {
      type: 'INTER_STATE',
      cgst: 0,
      sgst: 0,
      igst: parseFloat(taxAmount.toFixed(2)),
      totalTax: parseFloat(taxAmount.toFixed(2)),
      cgstRate: 0,
      sgstRate: 0,
      igstRate: taxRate,
    };
  }
};

/**
 * Extract state from address
 * @param {string} address - Full address string
 * @returns {string|null} State name
 */
export const extractStateFromAddress = (address) => {
  if (!address) return null;
  
  const upperAddress = address.toUpperCase();
  
  // Check for exact state name matches
  for (const [state, code] of Object.entries(INDIAN_STATES)) {
    if (upperAddress.includes(state)) {
      return state;
    }
  }
  
  return null;
};

/**
 * Get state code from state name
 * @param {string} stateName - State name
 * @returns {string|null} State GST code
 */
export const getStateCode = (stateName) => {
  if (!stateName) return null;
  const normalized = stateName.toUpperCase().trim();
  return INDIAN_STATES[normalized] || null;
};

/**
 * Calculate invoice total with GST
 * @param {array} products - Array of products
 * @param {string} sellerState - Seller's state
 * @param {string} buyerState - Buyer's state
 * @returns {object} Complete tax breakdown
 */
export const calculateInvoiceGST = (products, sellerState, buyerState) => {
  let totalTaxableAmount = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  const productBreakdown = products.map(product => {
    const taxableAmount = product.unitPrice * product.quantity;
    const taxRate = product.tax || 0;
    const gst = calculateGST(taxableAmount, taxRate, sellerState, buyerState);

    totalTaxableAmount += taxableAmount;
    totalCGST += gst.cgst;
    totalSGST += gst.sgst;
    totalIGST += gst.igst;

    return {
      ...product,
      taxableAmount,
      gstBreakdown: gst,
      totalAmount: taxableAmount + gst.totalTax,
    };
  });

  return {
    products: productBreakdown,
    summary: {
      taxableAmount: parseFloat(totalTaxableAmount.toFixed(2)),
      cgst: parseFloat(totalCGST.toFixed(2)),
      sgst: parseFloat(totalSGST.toFixed(2)),
      igst: parseFloat(totalIGST.toFixed(2)),
      totalTax: parseFloat((totalCGST + totalSGST + totalIGST).toFixed(2)),
      grandTotal: parseFloat((totalTaxableAmount + totalCGST + totalSGST + totalIGST).toFixed(2)),
      taxType: totalIGST > 0 ? 'INTER_STATE' : 'INTRA_STATE',
    },
  };
};
