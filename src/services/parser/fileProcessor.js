import { parseExcelFile } from './excelParser';
import { parsePDFFile } from './pdfParser';
import { parseImageFile, validateImageFile } from './imageParser';
import { extractWithRetry } from '../ai/geminiService';


/**
 * Main file processor - handles all file types
 */
export const processFile = async (file, onProgress) => {
  try {
    onProgress?.({ status: 'detecting', progress: 10, message: 'Detecting file type...' });
    
    const fileType = detectFileType(file);
    
    onProgress?.({ status: 'parsing', progress: 30, message: `Parsing ${fileType} file...` });
    
    let parsedData;
    
    switch (fileType) {
      case 'excel':
        parsedData = await parseExcelFile(file);
        break;
      case 'pdf':
        parsedData = await parsePDFFile(file);
        break;
      case 'image':
        validateImageFile(file);
        parsedData = await parseImageFile(file);
        break;
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
    
    onProgress?.({ status: 'extracting', progress: 50, message: 'Extracting data with AI (retrying if needed)...' });
    
    let extractedData;
    try {
      extractedData = await extractWithRetry(
        parsedData.textContent || '',  // Use text content if available (preferred)
        fileType,
        parsedData.base64Data || null  // Provide base64 as fallback
      );
    } catch (extractError) {
      console.error('❌ Extraction failed after all retries:', extractError);
      onProgress?.({ status: 'error', progress: 60, message: 'AI service temporarily unavailable - trying again in a moment...' });
      throw extractError;
    }
    
    onProgress?.({ status: 'validating', progress: 80, message: 'Validating extracted data...' });
    
    // Data is already validated in geminiService, now we just compact it
    const compacted = compactExtractedData(extractedData);
    
    onProgress?.({ status: 'complete', progress: 100, message: 'Processing complete!' });
    
    return {
      success: true,
      data: compacted,
      fileName: file.name,
      fileType,
      processedAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('File processing error:', error);
    throw error;
  }
};

/**
 * Compact normalized/validated extracted data to the minimal, consistent shape
 * the app expects and stores in Redux.
 */
const compactExtractedData = (data) => {
  const parseNumberSafe = (v) => {
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'number') return v;
    const cleaned = String(v).replace(/[,\s₹]/g, '').replace(/—/g, '-');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const invoices = (data.invoices || []).map((inv) => ({
    serialNumber: inv.serialNumber || '',
    customerName: inv.customerName || '',
    date: inv.date || null,
    totalAmount: parseNumberSafe(inv.totalAmount),
    taxAmount: parseNumberSafe(inv.taxAmount),
    products: (inv.products || []).map((p) => ({
      productName: p.productName || p.name || '',
      quantity: parseNumberSafe(p.quantity),
      unitPrice: parseNumberSafe(p.unitPrice),
      tax: parseNumberSafe(p.tax),
      amount: parseNumberSafe(p.amount),
    })),
    validation: data.validation || { errors: [], warnings: [], missingFields: [] },
    confidence: data.confidence || { score: 0, status: 'low' }
  }));

  const products = (data.products || []).map((p) => ({
    name: p.name || '',
    quantity: parseNumberSafe(p.quantity),
    unitPrice: parseNumberSafe(p.unitPrice),
    tax: parseNumberSafe(p.tax),
    priceWithTax: parseNumberSafe(p.priceWithTax),
    discount: parseNumberSafe(p.discount || 0),
  }));

  const customers = (data.customers || []).map((c) => ({
    name: c.name || '',
    phoneNumber: c.phoneNumber || '',
    email: c.email || '',
    gstin: c.gstin || '',
    address: c.address || '',
    totalPurchaseAmount: parseNumberSafe(c.totalPurchaseAmount || 0),
  }));

  return {
    summary: data.summary || null,
    invoices,
    products,
    customers,
    missingFields: data.validation?.missingFields || [],
    confidence: data.confidence,
    validation: data.validation
  };
};

/**
 * Process multiple files
 */
export const processMultipleFiles = async (files, onProgress) => {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      onProgress?.({
        status: 'processing',
        progress: (i / files.length) * 100,
        message: `Processing file ${i + 1} of ${files.length}: ${file.name}`,
        currentFile: i + 1,
        totalFiles: files.length,
      });
      
      const result = await processFile(file, (fileProgress) => {
        onProgress?.({
          ...fileProgress,
          currentFile: i + 1,
          totalFiles: files.length,
        });
      });
      
      results.push(result);
    } catch (error) {
      errors.push({
        fileName: file.name,
        error: error.message,
      });
    }
  }
  
  return {
    results,
    errors,
    totalProcessed: results.length,
    totalFailed: errors.length,
  };
};

/**
 * Detect file type from file object
 */
export const detectFileType = (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  // Excel files
  if (
    extension === 'xlsx' ||
    extension === 'xls' ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel')
  ) {
    return 'excel';
  }
  
  // PDF files
  if (extension === 'pdf' || mimeType === 'application/pdf') {
    return 'pdf';
  }
  
  // Image files
  if (
    ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ||
    mimeType.startsWith('image/')
  ) {
    return 'image';
  }
  
  throw new Error(`Unsupported file format: ${file.name}`);
};

/**
 * Validate extracted data and identify missing fields
 */
const validateExtractedData = (data) => {
  const validated = { ...data };
  
  // Validate invoices
  validated.invoices = data.invoices.map((invoice) => {
    const errors = [];
    
    if (!invoice.serialNumber) errors.push('serialNumber');
    if (!invoice.customerName) errors.push('customerName');
    if (!invoice.date) errors.push('date');
    if (!invoice.totalAmount || invoice.totalAmount === 0) errors.push('totalAmount');
    
    return {
      ...invoice,
      validationErrors: errors,
    };
  });
  
  // Validate products
  validated.products = data.products.map((product) => {
    const errors = [];
    
    if (!product.name) errors.push('name');
    if (!product.quantity || product.quantity === 0) errors.push('quantity');
    if (!product.unitPrice || product.unitPrice === 0) errors.push('unitPrice');
    
    return {
      ...product,
      validationErrors: errors,
    };
  });
  
  // Validate customers
  validated.customers = data.customers.map((customer) => {
    const errors = [];
    
    if (!customer.name) errors.push('name');
    if (!customer.phoneNumber) errors.push('phoneNumber');
    if (!customer.totalPurchaseAmount || customer.totalPurchaseAmount === 0) {
      errors.push('totalPurchaseAmount');
    }
    
    return {
      ...customer,
      validationErrors: errors,
    };
  });
  
  return validated;
};

/**
 * Get file size in human-readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
