const invoiceText = `TA X I N V O I C E ORIGIN AL FOR RECIPIENT
EInvoices
GSTIN: 29AABCT1332L000
H/No 1 59/9, M.S.R.Y Nilayam, 4th floor,
Masjid Banda, Kondapur , Rangareddy, Hyderabad
Bangalore South, KARNATAKA, 560030
Mobile: +91 9999999999
Email: Swipe@gmail.com
Consignee:
Shounak
NextSpeed Technologies Pvt Ltd
GSTIN: ABCDE1234567890
Ph: 9999999994
Invoice #:
INV-148CZS
Invoice Date:
12 Nov 2024
Place of Supply:
29-KARNATAKA
Sl Description Rate/Item Quantity Taxable Value GST Amount
1 GEMS CHOCLATE POUCH 4.7619 1,000.000 4,761.90 238.10 (5%) 5,000.00
2 TREAT BKS CASE 80PKT 535.7143 50.000 26,785.71 3,214.29
(12%)
30,000.00
3 NUTRI CHOICE BKS CASE 666.6667 25.000 16,666.67 833.33 (5%) 17,500.00
4 MILK BIKIS CLASSIC CASE 120PK 809.5238 20.000 16,190.48 809.52 (5%) 17,000.00
Total Items / Qty : 4 / 1,095.000
Making charges ₹123456.00
debit card charges ₹12345.00
Shipping Charges ₹60.00
Shipping Charges ₹60.00
Shipping Charges ₹60.00
Taxable Amount ₹2,00,385.76
CGST 2.5% ₹940.48
SGST 2.5% ₹940.48
CGST 6.0% ₹1,607.14
SGST 6.0% ₹1,607.14
Total ₹2,05,481.00
Total amount (in words): INR Two Lakh, Five Thousand, Four Hundred And Eighty-One Rupees Only.
Amount Payable: ₹2,05,481.00
Total Amount due: ₹2,05,481.00
`;

function parseNumber(s) {
  if (s === undefined || s === null) return 0;
  const cleaned = String(s).replace(/[,₹\s]/g, '').replace(/—/g, '-');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function toISODate(str) {
  const d = new Date(str);
  if (!isNaN(d)) return d.toISOString().split('T')[0];
  // Try manual parse like '12 Nov 2024'
  const parts = str.match(/(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/);
  if (parts) {
    const dd = parts[1];
    const mm = parts[2];
    const yyyy = parts[3];
    const ds = `${dd} ${mm} ${yyyy}`;
    const d2 = new Date(ds);
    if (!isNaN(d2)) return d2.toISOString().split('T')[0];
  }
  return null;
}

// Split lines and normalize
const lines = invoiceText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

// Extract header fields
let _sellerGST = null;
let consignee = null;
  let consigneeGST = null;
let invoiceNumber = null;
let invoiceDate = null;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.startsWith('GSTIN:')) _sellerGST = l.split(':')[1].trim();
  if (l.toLowerCase().startsWith('consignee')) {
    // next non-empty line is consignee name
    if (lines[i+1]) consignee = lines[i+1];
  }
  if (l.startsWith('GSTIN:') && i>0 && lines[i-1].toLowerCase().includes('consignee')) {
    consigneeGST = l.split(':')[1].trim();
  }
  if (/Invoice\s*#|Invoice #:|Invoice #:|Invoice #/i.test(l) && lines[i+1]) {
    const possible = lines[i+1];
    if (/INV[-\w\d]+/i.test(possible)) invoiceNumber = possible.match(/INV[-\w\d]+/i)[0];
  }
  if (/Invoice Date:/i.test(l) && lines[i+1]) {
    invoiceDate = toISODate(lines[i+1]);
  }
}

// Items: lines starting with index
const itemLines = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (/^\d+\s+/.test(l)) {
    // collect possibly following wrapped lines until next item or Total
    let j = i;
    let combined = lines[j];
    j++;
    while (j < lines.length && !/^\d+\s+/.test(lines[j]) && !/^Total\b/i.test(lines[j]) && !/^Making charges/i.test(lines[j]) && !/GSTIN:/i.test(lines[j])) {
      // stop if next line looks like another distinct field header
      // if next line is a lone percent like (12%), attach it
      combined += ' ' + lines[j];
      j++;
    }
    itemLines.push(combined);
  }
}

const products = itemLines.map(line => {
  // remove leading index
  const rest = line.replace(/^\d+\s+/, '');
  // extract all number tokens (including numbers with commas and decimals)
  const numTokens = [...rest.matchAll(/[0-9,]+(?:\.\d+)?/g)].map(m => m[0]);
  // description is the part before first number token
  let desc = rest;
  if (numTokens.length) {
    const idx = rest.indexOf(numTokens[0]);
    desc = rest.slice(0, idx).trim();
  }
  // Map numbers from the end: last = total, prev = maybe total on separate line, prev = taxAmount, prev = taxableValue, prev = quantity, prev = rate
  const toks = numTokens.map(t => parseNumber(t));
  const tlen = toks.length;
  const total = tlen >= 1 ? toks[tlen-1] : 0;
  const taxAmount = tlen >= 2 ? toks[tlen-2] : 0;
  const taxableValue = tlen >= 3 ? toks[tlen-3] : 0;
  const quantity = tlen >= 4 ? toks[tlen-4] : 0;
  const rate = tlen >= 5 ? toks[tlen-5] : 0;

  return {
    name: desc || 'Unknown',
    quantity,
    unitPrice: rate,
    tax: taxAmount,
    amount: total || taxableValue,
  };
});

// Aggregate products
const prodMap = {};
products.forEach(p => {
  const key = p.name;
  if (!prodMap[key]) prodMap[key] = { name: key, quantity: 0, unitPrice: p.unitPrice || 0, tax: 0, priceWithTax: 0 };
  prodMap[key].quantity += p.quantity || 0;
  prodMap[key].tax += p.tax || 0;
  prodMap[key].priceWithTax += p.amount || 0;
});

const aggregatedProducts = Object.values(prodMap);

// Totals
let taxableAmount = null;
let totalAmount = null;
let totalTax = 0;
  for (const l of lines) {
    if (/Taxable Amount/i.test(l)) {
      const m = l.match(/[0-9,]+(?:\.\d+)?/);
      if (m) taxableAmount = parseNumber(m[0]);
    }
  if (/^Total\b/i.test(l)) {
    const m = l.match(/([0-9,]+(?:\.\d+)?)/g);
    if (m) {
      // last numeric on that line
      totalAmount = parseNumber(m[m.length-1]);
    }
  }
  // CGST/SGST lines
  if (/CGST/i.test(l) || /SGST/i.test(l) || /IGST/i.test(l)) {
    const m = l.match(/([0-9,]+(?:\.\d+)?)/g);
    if (m) {
      // take last number as tax
      totalTax += parseNumber(m[m.length-1]);
    }
  }
}

// If taxableAmount missing, try sum of taxable values parsed
if (!taxableAmount) {
  const sumTaxable = products.reduce((s,p) => s + (p.amount && p.tax===0 ? p.amount : (p.amount? p.amount:0)), 0);
  taxableAmount = sumTaxable || null;
}

if (!totalAmount) {
  // sum product totals + other charges
  totalAmount = aggregatedProducts.reduce((s,p) => s + (p.priceWithTax || 0), 0);
  // add making charges and others
  for (const l of lines) {
    if (/Making charges/i.test(l)) {
      const m = l.match(/([0-9,]+(?:\.\d+)?)/);
      if (m) totalAmount += parseNumber(m[0]);
    }
    if (/debit card charges/i.test(l)) {
      const m = l.match(/([0-9,]+(?:\.\d+)?)/);
      if (m) totalAmount += parseNumber(m[0]);
    }
    if (/Shipping Charges/i.test(l)) {
      const m = l.match(/([0-9,]+(?:\.\d+)?)/);
      if (m) totalAmount += parseNumber(m[0]);
    }
  }
}

// Customer
const customerName = consignee || 'Unknown';

// Build normalized JSON
const normalized = {
  summary: {
    invoiceCount: 1,
    totalValue: totalAmount || 0,
    totalTax: totalTax || 0,
    topCustomer: customerName,
    topProduct: aggregatedProducts.length ? aggregatedProducts.reduce((best,p)=> (p.quantity>(best.quantity||0)?p:best), {}) .name || '' : '',
    missingDataNotes: ''
  },
  invoices: [
    {
      serialNumber: invoiceNumber || '',
      customerName: customerName,
      date: invoiceDate || null,
      totalAmount: totalAmount || 0,
      taxAmount: totalTax || 0,
      products: products
    }
  ],
  products: aggregatedProducts,
  customers: [
    {
      name: customerName,
      phoneNumber: '',
      email: '',
      gstin: consigneeGST || '',
      address: '',
      totalPurchaseAmount: totalAmount || 0
    }
  ],
  missingFields: {
    invoices: [],
    products: [],
    customers: []
  }
};

console.log(JSON.stringify(normalized, null, 2));
