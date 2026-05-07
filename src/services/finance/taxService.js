/**
 * Tax Service - Handles GST calculations and state management for invoices
 */

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
 * Calculate detailed GST breakdown for a taxable amount
 */
export const calculateGST = (taxableAmount, taxRate, sellerState, buyerState) => {
  if (isNaN(taxableAmount) || isNaN(taxRate)) {
    return { cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
  }

  const normalizedSeller = sellerState?.toUpperCase().trim();
  const normalizedBuyer = buyerState?.toUpperCase().trim();
  
  const isIntraState = normalizedSeller === normalizedBuyer;
  const totalTaxAmount = (taxableAmount * taxRate) / 100;

  if (isIntraState) {
    const halfTax = totalTaxAmount / 2;
    return {
      type: 'INTRA_STATE',
      cgst: Number(halfTax.toFixed(2)),
      sgst: Number(halfTax.toFixed(2)),
      igst: 0,
      totalTax: Number(totalTaxAmount.toFixed(2)),
      cgstRate: taxRate / 2,
      sgstRate: taxRate / 2,
      igstRate: 0,
    };
  }

  return {
    type: 'INTER_STATE',
    cgst: 0,
    sgst: 0,
    igst: Number(totalTaxAmount.toFixed(2)),
    totalTax: Number(totalTaxAmount.toFixed(2)),
    cgstRate: 0,
    sgstRate: 0,
    igstRate: taxRate,
  };
};

/**
 * Calculate complete invoice tax summary
 */
export const calculateInvoiceGST = (products, sellerState, buyerState) => {
  if (!Array.isArray(products)) return null;

  const results = products.reduce((acc, product) => {
    const amount = (product.unitPrice || 0) * (product.quantity || 0);
    const tax = product.taxRate || product.tax || 0;
    const gst = calculateGST(amount, tax, sellerState, buyerState);

    acc.taxableAmount += amount;
    acc.cgst += gst.cgst;
    acc.sgst += gst.sgst;
    acc.igst += gst.igst;
    
    acc.processedProducts.push({
      ...product,
      taxableAmount: amount,
      gstBreakdown: gst,
      totalAmount: Number((amount + gst.totalTax).toFixed(2)),
    });

    return acc;
  }, {
    taxableAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    processedProducts: []
  });

  const totalTax = results.cgst + results.sgst + results.igst;

  return {
    products: results.processedProducts,
    summary: {
      taxableAmount: Number(results.taxableAmount.toFixed(2)),
      cgst: Number(results.cgst.toFixed(2)),
      sgst: Number(results.sgst.toFixed(2)),
      igst: Number(results.igst.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      grandTotal: Number((results.taxableAmount + totalTax).toFixed(2)),
      taxType: results.igst > 0 ? 'INTER_STATE' : 'INTRA_STATE',
    },
  };
};

export const extractStateFromAddress = (address) => {
  if (!address) return null;
  const upper = address.toUpperCase();
  const foundState = Object.keys(INDIAN_STATES).find(state => upper.includes(state));
  return foundState || null;
};

