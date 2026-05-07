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
    
    console.log('🔄 Processing:', {
      fileType,
      fileName: file.name,
      size: file.size,
      hasText: !!parsedData.textContent,
      textLength: parsedData.textContent?.length || 0,
      hasBase64: !!parsedData.base64Data,
      base64Length: parsedData.base64Data?.length || 0
    });

    // Extract structured data using Gemini (with automatic retries)
    // Smart strategy: prefer text extraction if available, fallback to Vision API
    let extractedData;
    try {
      extractedData = await extractWithRetry(
        parsedData.textContent || '',  // Use text content if available (preferred)
        fileType,
        parsedData.base64Data || null  // Provide base64 as fallback
      );
    } catch (extractError) {
      // If extraction fails completely, provide helpful guidance
      console.error('❌ Extraction failed after all retries:', extractError);
      onProgress?.({ status: 'error', progress: 60, message: 'AI service temporarily unavailable - trying again in a moment...' });
      throw extractError;
    }
    
    onProgress?.({ status: 'validating', progress: 80, message: 'Validating extracted data...' });
    
    // Validate extracted data
    const validatedData = validateExtractedData(extractedData);

  // ---- Compact / normalize the validated data to the exact shape we store/display
  const compacted = compactExtractedData(validatedData);
    
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
    // keep keys the UI expects
    serialNumber: inv.serialNumber || inv.invoiceNumber || '',
    customerName: inv.customerName || inv.customer || '',
    date: inv.date || inv.invoiceDate || null,
    totalAmount: parseNumberSafe(inv.totalAmount || inv.total || inv.amount),
    taxAmount: parseNumberSafe(inv.taxAmount || inv.tax || 0),
    // products: ensure productName key exists for UI
    products: (inv.products || []).map((p) => ({
      productName: p.productName || p.name || p.description || '',
      quantity: parseNumberSafe(p.quantity || p.qty || 0),
      unitPrice: parseNumberSafe(p.unitPrice || p.rate || p.price || 0),
      tax: parseNumberSafe(p.tax || p.taxAmount || 0),
      amount: parseNumberSafe(p.amount || p.total || 0),
    })),
    validationErrors: inv.validationErrors || [],
  }));

  const products = (data.products || []).map((p) => ({
    name: p.name || p.productName || '',
    quantity: parseNumberSafe(p.quantity || p.qty || 0),
    unitPrice: parseNumberSafe(p.unitPrice || p.rate || p.price || 0),
    tax: parseNumberSafe(p.tax || p.taxAmount || 0),
    priceWithTax: parseNumberSafe(p.priceWithTax || p.priceWith_Tax || 0),
    discount: parseNumberSafe(p.discount || 0),
  }));

  const customers = (data.customers || []).map((c) => ({
    name: c.name || '',
    phoneNumber: c.phoneNumber || c.phone || '',
    email: c.email || '',
    gstin: c.gstin || '',
    address: c.address || '',
    totalPurchaseAmount: parseNumberSafe(c.totalPurchaseAmount || c.totalPurchase || 0),
  }));

  return {
    summary: data.summary || null,
    invoices,
    products,
    customers,
    missingFields: data.missingFields || { invoices: [], products: [], customers: [] },
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
