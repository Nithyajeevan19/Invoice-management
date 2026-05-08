import { GoogleGenerativeAI } from '@google/generative-ai';
import { normalizeDate, normalizeNumber, normalizeGSTIN, normalizeEmail, normalizePhone, normalizeCurrency } from './utils/normalization';
import { validateInvoiceMath, validateRequiredFields, validateTaxConsistency } from './utils/validation';
import { calculateConfidenceScore } from './utils/confidence';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('⚠️ VITE_GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Enterprise-grade prompt for invoice extraction
 */
const getExtractionPrompt = (fileType) => `
You are a senior financial data architect. Extract all data from this invoice with 100% precision.
Normalize all values. Handle noisy OCR text. Infer missing fields intelligently from context.

STRICT JSON OUTPUT ONLY. DO NOT INCLUDE MARKDOWN OR EXPLANATIONS.

{
  "invoice": {
    "serialNumber": "Exact invoice number",
    "date": "YYYY-MM-DD",
    "dueDate": "YYYY-MM-DD or null",
    "currency": "3-letter code (e.g. INR, USD)",
    "category": "e.g. Utilities, Inventory, Services",
    "status": "paid|pending|overdue",
    "subtotal": number,
    "taxAmount": number,
    "totalAmount": number,
    "discount": number
  },
  "customer": {
    "name": "Full legal name",
    "phoneNumber": "Digits and + only",
    "email": "Valid email address",
    "gstin": "15-char GSTIN if in India",
    "address": "Full billing address",
    "shippingAddress": "Full shipping address or same as billing"
  },
  "vendor": {
    "name": "Company name",
    "address": "Full address",
    "gstin": "Vendor's GSTIN",
    "phone": "Contact number"
  },
  "items": [
    {
      "name": "Product or service name",
      "quantity": number,
      "unitPrice": number,
      "taxRate": number (percentage),
      "taxAmount": number,
      "amount": number (qty * price + tax),
      "hsnCode": "string or null"
    }
  ],
  "taxBreakdown": {
    "cgst": number,
    "sgst": number,
    "igst": number,
    "cess": number
  },
  "metadata": {
    "isHandwritten": boolean,
    "containsLogo": boolean,
    "language": "ISO code"
  }
}

INSTRUCTIONS:
1. Search EVERY corner for Email and GSTIN.
2. If math is inconsistent, provide the values as written but flag it in metadata.
3. Dates must be YYYY-MM-DD. If year is missing, assume current year (2025).
4. Extract line items meticulously.
5. Never return "NaN" or "undefined" - use 0 for numbers and "" for strings.
`;

/**
 * Layered Regex Fallback Parser
 */
const regexExtraction = (content) => {
  const result = {
    invoice: { serialNumber: '', date: '', totalAmount: 0, taxAmount: 0 },
    customer: { name: '', gstin: '', email: '' },
    items: []
  };

  try {
    const serial = content.match(/Invoice\s*(?:No|Number|#)[:.\s]*([A-Z0-9-]+)/i);
    const date = content.match(/(?:Date|Dated)[:.\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
    const total = content.match(/(?:Total|Amount|Due)[:.\s]*(?:Rs\.|₹|INR)?\s*([\d,]+\.?\d*)/i);
    const gstin = content.match(/GSTIN[:.\s]*([0-9A-Z]{15})/i);
    const email = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

    if (serial) result.invoice.serialNumber = serial[1].trim();
    if (date) result.invoice.date = normalizeDate(date[1]);
    if (total) result.invoice.totalAmount = normalizeNumber(total[1]);
    if (gstin) result.customer.gstin = normalizeGSTIN(gstin[1]);
    if (email) result.customer.email = normalizeEmail(email[1]);

    return result;
  } catch (e) {
    return result;
  }
};

export const extractInvoiceData = async (fileContent, fileType, fileData = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = getExtractionPrompt(fileType);
    
    let result;
    const hasTextContent = fileContent && fileContent.trim().length > 50;
    const hasFileData = fileData && fileData.length > 0;
    const useVisionAPI = (fileType === 'image' || (fileType === 'pdf' && !hasTextContent)) && hasFileData;
    
    if (useVisionAPI) {
      const parts = [
        { text: prompt },
        { inlineData: { data: fileData, mimeType: fileType === 'pdf' ? 'application/pdf' : 'image/jpeg' } }
      ];
      result = await model.generateContent(parts);
    } else {
      result = await model.generateContent([prompt, fileContent]);
    }
    
    const response = await result.response;
    let text = response.text();
    
    // 1. CLEANING & PARSING
    try {
      text = text.replace(/```json\n|\n```/g, '').trim();
      const rawData = JSON.parse(text);
      
      // 2. NORMALIZATION
      const normalized = {
        invoices: [{
          serialNumber: rawData.invoice.serialNumber || '',
          date: normalizeDate(rawData.invoice.date),
          dueDate: normalizeDate(rawData.invoice.dueDate),
          customerName: rawData.customer.name || '',
          totalAmount: normalizeNumber(rawData.invoice.totalAmount),
          taxAmount: normalizeNumber(rawData.invoice.taxAmount || rawData.invoice.subtotal * 0.18), // Intelligent fallback
          currency: normalizeCurrency(rawData.invoice.currency),
          category: rawData.invoice.category || 'General',
          status: rawData.invoice.status || 'pending',
          products: (rawData.items || []).map(item => ({
            productName: item.name || '',
            quantity: normalizeNumber(item.quantity),
            unitPrice: normalizeNumber(item.unitPrice),
            tax: normalizeNumber(item.taxRate),
            amount: normalizeNumber(item.amount || (item.quantity * item.unitPrice))
          })),
          taxBreakdown: rawData.taxBreakdown || {}
        }],
        products: (rawData.items || []).map(item => ({
          name: item.name || '',
          quantity: normalizeNumber(item.quantity),
          unitPrice: normalizeNumber(item.unitPrice),
          tax: normalizeNumber(item.taxRate),
          priceWithTax: normalizeNumber(item.unitPrice * (1 + (item.taxRate || 0)/100)),
          discount: 0
        })),
        customers: [{
          name: rawData.customer.name || '',
          phoneNumber: normalizePhone(rawData.customer.phoneNumber),
          email: normalizeEmail(rawData.customer.email),
          gstin: normalizeGSTIN(rawData.customer.gstin),
          address: rawData.customer.address || '',
          totalPurchaseAmount: normalizeNumber(rawData.invoice.totalAmount)
        }],
        vendor: rawData.vendor || {}
      };

      // 3. REGEX FALLBACK (for critical fields if missing)
      if (!normalized.invoices[0].serialNumber || !normalized.invoices[0].totalAmount) {
        const fallbacks = regexExtraction(fileContent || '');
        if (fallbacks.invoice.serialNumber) normalized.invoices[0].serialNumber = fallbacks.invoice.serialNumber;
        if (fallbacks.invoice.totalAmount) normalized.invoices[0].totalAmount = fallbacks.invoice.totalAmount;
      }

      // 4. VALIDATION
      const mathResult = validateInvoiceMath(normalized.invoices[0]);
      const missingFields = validateRequiredFields(normalized);
      const taxWarnings = validateTaxConsistency(normalized.invoices[0]);

      // 5. CONFIDENCE SCORING
      const confidence = calculateConfidenceScore(normalized, fileContent);
      
      return {
        ...normalized,
        confidence,
        validation: {
          errors: mathResult.errors,
          warnings: [...mathResult.warnings, ...taxWarnings],
          missingFields
        }
      };
    } catch (parseError) {
      // Final Fallback: Pure Regex if AI fails to return JSON
      console.error('AI JSON parse failed, using regex fallback');
      const fallbacks = regexExtraction(fileContent || '');
      return {
        invoices: [{
          serialNumber: fallbacks.invoice.serialNumber,
          customerName: fallbacks.customer.name,
          date: fallbacks.invoice.date,
          totalAmount: fallbacks.invoice.totalAmount,
          products: [],
          status: 'pending'
        }],
        confidence: { score: 30, status: 'low' },
        validation: { errors: ['AI parsing failed'], warnings: [], missingFields: [] }
      };
    }
  } catch (error) {
    console.error('❌ Extraction error:', error);
    throw error;
  }
};

export const extractWithRetry = async (fileContent, fileType, fileData = null) => {
  const maxRetries = 3;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await extractInvoiceData(fileContent, fileType, fileData);
    } catch (error) {
      lastError = error;
      const waitTime = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
  throw lastError;
};
