import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('⚠️ VITE_GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Deterministic parser as fallback when AI extraction fails
const deterministicParse = (content) => {
  // Initialize result structure
  const result = {
    invoices: [],
    products: [],
    customers: [],
    missingFields: {
      invoices: [],
      products: [],
      customers: []
    }
  };

  try {
    // Look for common invoice patterns
    const serialMatch = content.match(/Invoice\s*(?:No|Number|#)[:.\s]*([A-Z0-9-]+)/i);
    const dateMatch = content.match(/(?:Date|Dated|Invoice Date)[:.\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})/i);
    const amountMatch = content.match(/(?:Total|Amount|Grand Total)[:.\s]*(?:Rs\.|₹|INR)?\s*([\d,]+\.?\d*)/i);
    const taxMatch = content.match(/(?:Tax|GST|VAT)[:.\s]*(?:Rs\.|₹|INR)?\s*([\d,]+\.?\d*)/i);
    
    // Look for customer information
    const customerMatch = content.match(/(?:Customer|Bill To|Billed To|Sold To)[:.\s]*([^\n]+)/i);
    const gstinMatch = content.match(/GSTIN[:.\s]*([0-9A-Z]+)/i);
    const emailMatch = content.match(/(?:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i);
    const phoneMatch = content.match(/(?:Phone|Tel|Mobile)[:.\s]*([+\d-]{10,})/i);

    // If we found any data, create an invoice entry
    if (serialMatch || dateMatch || amountMatch || customerMatch) {
      const invoice = {
        serialNumber: serialMatch ? serialMatch[1].trim() : "",
        customerName: customerMatch ? customerMatch[1].trim() : "",
        date: dateMatch ? formatDate(dateMatch[1]) : "",
        totalAmount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0,
        taxAmount: taxMatch ? parseFloat(taxMatch[1].replace(/,/g, '')) : 0,
        products: []
      };
      
      // Look for product table patterns
      const productLines = content.match(/(?:Item|Description|Product).*?(?:Qty|Quantity).*?(?:Rate|Price).*?(?:Amount|Total)[^\n]*\n([\s\S]*?)(?:Total|Sub|$)/i);
      if (productLines && productLines[1]) {
        const lines = productLines[1].split('\n').filter(line => line.trim());
        for (const line of lines) {
          const parts = line.split(/\s{2,}|\t/);
          if (parts.length >= 4) {
            invoice.products.push({
              name: parts[0].trim(),
              quantity: parseFloat(parts[1].replace(/,/g, '')) || 0,
              unitPrice: parseFloat(parts[2].replace(/,/g, '')) || 0,
              tax: 0,
              amount: parseFloat(parts[3].replace(/,/g, '')) || 0
            });
          }
        }
      }
      
      result.invoices.push(invoice);
      
      // Add customer if we found any customer data
      if (customerMatch || emailMatch || phoneMatch || gstinMatch) {
        result.customers.push({
          name: customerMatch ? customerMatch[1].trim() : "",
          phoneNumber: phoneMatch ? phoneMatch[1].trim() : "",
          email: emailMatch ? emailMatch[0] : "",
          gstin: gstinMatch ? gstinMatch[1] : "",
          address: "",
          totalPurchaseAmount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0
        });
      }
    }

    return {
      hasData: result.invoices.length > 0 || result.customers.length > 0,
      data: result
    };
  } catch (error) {
    console.error('Deterministic parsing failed:', error);
    return { hasData: false, data: result };
  }
};

// Helper to format dates consistently
const formatDate = (dateStr) => {
  try {
    const parts = dateStr.split(/[-/]/);
    if (parts.length !== 3) return "";
    
    // Handle both DD/MM/YYYY and YYYY/MM/DD formats
    const year = parts[2].length === 4 ? parts[2] : parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[0].length === 4 ? parts[2] : parts[0].padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

export const extractInvoiceData = async (fileContent, fileType, fileData = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
  You are an expert invoice data extraction system. Your task is to extract invoice information from the provided content.

  CRITICAL: SEARCH THE ENTIRE DOCUMENT FOR EMAIL AND GSTIN - DO NOT MISS THEM!

  CUSTOMER INFORMATION - HIGHEST PRIORITY:

  EMAIL EXTRACTION (MANDATORY):
  - Search for EXACT pattern: "Email:" or "Email :" or "email:" followed by any text containing @
  - Look for: Swipe@gmail.com, admin@company.com, any@domain pattern
  - Search in ALL sections: header, company info, contact details
  - Examples to find: Swipe@gmail.com, support@swipe.com, contact@test.com
  - If found: Extract the EXACT email address (do not modify)
  - If NOT found: Set email to empty string ""

  GSTIN EXTRACTION (MANDATORY):
  - Search for EXACT pattern: "GSTIN" or "GST No" or "GST:" followed by 15 character code
  - Format: Two digits + Five letters + Four digits + One letter + Three alphanumeric (e.g., 29AABCT1332L000)
  - Search in ALL sections: company header, tax info
  - Look for: 29AABCT1332L000 or similar 15-char code
  - If found: Extract the EXACT GSTIN number
  - If NOT found: Set gstin to empty string ""

  PHONE EXTRACTION:
  - Search for: Mobile:, Phone:, +91, 9999999999 format
  - If found: Include it
  - If NOT found: Set phoneNumber to empty string ""

  Extract in JSON format:

  {
    "invoices": [
      {
        "serialNumber": "string",
        "customerName": "string",
        "date": "YYYY-MM-DD",
        "totalAmount": number,
        "taxAmount": number,
        "products": [
          {
            "name": "string", 
            "quantity": number,
            "unitPrice": number,
            "tax": number,
            "amount": number
          }
        ]
      }
    ],
    "products": [
      {
        "name": "string",
        "quantity": number,
        "unitPrice": number,
        "tax": number,
        "priceWithTax": number,
        "discount": 0
      }
    ],
    "customers": [
      {
        "name": "string",
        "phoneNumber": "string",
        "email": "string",
        "gstin": "string",
        "address": "string",
        "totalPurchaseAmount": number
      }
    ],
    "missingFields": {
      "invoices": [],
      "products": [],
      "customers": []
    }
  }

  IMPORTANT RULES:
  1. Extract ONLY actual data - do NOT generate dummy data
  2. Use empty string "" for any field not found (NOT null)
  3. ALWAYS include all customer fields in response
  4. All amounts must be numbers
  5. All dates must be in YYYY-MM-DD format
  6. Return ONLY valid JSON

  SEARCH STRATEGY:
  1. First: Find email by looking for @ symbol pattern
  2. Second: Find GSTIN by looking for 15-character alphanumeric code
  3. Third: Extract other invoice data
  4. Fourth: Extract product data

  File Type: ${fileType}

  Data:
  ${fileContent}
    `;
    
    let result;
    
    // Determine if we should use Vision API
    const hasTextContent = fileContent && fileContent.trim().length > 50;
    const hasFileData = fileData && fileData.length > 0;
    const useVisionAPI = (fileType === 'image' || (fileType === 'pdf' && !hasTextContent)) && hasFileData;
    
    console.log('📄 Extraction strategy:', {
      fileType,
      hasTextContent,
      hasFileData,
      useVisionAPI,
      textContentLength: fileContent?.length || 0,
      base64Length: fileData?.length || 0
    });
    
    if (useVisionAPI) {
      // Use Vision API for images or PDFs without text extraction
      const parts = [
        { text: prompt },
        {
          inlineData: {
            data: fileData,
            mimeType: fileType === 'pdf' ? 'application/pdf' : 'image/jpeg',
          },
        },
      ];
      console.log('🖼️ Using Vision API:', {
        fileType,
        promptLength: prompt.length,
        base64Length: fileData?.length || 0
      });
      result = await model.generateContent(parts);
    } else if (hasTextContent) {
      // Use text content (preferred for PDFs with extracted text)
      console.log('📝 Using text extraction:', {
        promptLength: prompt.length,
        contentType: fileType,
        textLength: fileContent.length
      });
      result = await model.generateContent(prompt);
    } else {
      // Fallback to Vision API if we have file data
      if (hasFileData) {
        console.log('🔄 Falling back to Vision API - no text content');
        const parts = [
          { text: prompt },
          {
            inlineData: {
              data: fileData,
              mimeType: fileType === 'pdf' ? 'application/pdf' : 'image/jpeg',
            },
          },
        ];
        result = await model.generateContent(parts);
      } else {
        throw new Error('No content available for extraction - neither text nor file data');
      }
    }
    
    const response = await result.response;
    let text = response.text();
    
    console.log('🎯 Raw Gemini response:', {
      length: text.length,
      preview: text.substring(0, 300)
    });
    
    try {
      // Clean up markdown formatting if present
      if (text.includes('```json')) {
        text = text.replace(/```json\n|\n```/g, '');
      }
      
      // Remove any remaining markdown artifacts
      text = text.trim()
        .replace(/^```\s*|\s*```$/g, '')  // Remove any remaining code blocks
        .replace(/^\s*\{/, '{')           // Clean up leading whitespace before {
        .replace(/\}\s*$/, '}');          // Clean up trailing whitespace after }
      
      // Attempt to parse the cleaned response as JSON
      const data = JSON.parse(text);
      
      // Validate the parsed data has the expected structure
      if (!data.invoices || !Array.isArray(data.invoices)) {
        throw new Error('Invalid response structure: missing invoices array');
      }

      // Check if we got any actual data
      const isEmpty = (
        data.invoices.length === 0 &&
        data.products.length === 0 &&
        data.customers.length === 0
      );

      if (isEmpty) {
        console.warn('⚠️ No data extracted from Gemini, checking raw content...');
        
        // Log the first 500 characters of raw content for debugging
        console.log('Raw content preview:', fileContent.substring(0, 500));
        
        // Try deterministic parsing as fallback
        const extracted = deterministicParse(fileContent);
        if (extracted.hasData) {
          console.log('✅ Found data using deterministic parser');
          return extracted.data;
        }
        
        throw new Error('No invoice data could be extracted from the content');
      }
      
      console.log('✅ Data extraction successful - found:', {
        invoices: data.invoices.length,
        products: data.products.length,
        customers: data.customers.length
      });
      
      return data;
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON:', parseError);
      console.log('Raw response:', text);
      throw new Error('Invalid JSON response from Gemini: ' + parseError.message);
    }
  } catch (error) {
    console.error('❌ Extraction error:', error);
    throw error;
  }
};



export const extractWithRetry = async (fileContent, fileType, fileData = null) => {
  // Increased retries for 503 errors (service unavailable)
  const maxRetries = 5;
  const max503Retries = 10;
  let lastError;
  let is503Error = false;
  
  // Determine max retries based on error type
  let retriesAllowed = maxRetries;
  
  for (let i = 0; i < retriesAllowed; i++) {
    try {
      console.log(`🔄 Extraction attempt ${i + 1}/${retriesAllowed}`);
      const result = await extractInvoiceData(fileContent, fileType, fileData);

      console.log('✅ Extraction successful!', result);
      return result;
    } catch (error) {
      lastError = error;
      const errorMessage = error.message || error.toString();
      
      // Check if this is a 503 Service Unavailable error
      is503Error = errorMessage.includes('503') || 
                   errorMessage.includes('high demand') ||
                   errorMessage.includes('Service Unavailable');
      
      console.error(`❌ Attempt ${i + 1} failed:`, errorMessage);
      
      // If we detected a 503 error and haven't reached max 503 retries, increase retry limit
      if (is503Error && retriesAllowed === maxRetries) {
        retriesAllowed = max503Retries;
        console.log(`⚠️ Detected API high demand (503). Increasing retries to ${max503Retries} attempts.`);
      }
      
      if (i < retriesAllowed - 1) {
        // Enhanced backoff strategy:
        // - For 503 errors: use longer exponential backoff with jitter
        // - For other errors: use standard backoff
        let waitTime;
        
        if (is503Error) {
          // For 503: wait longer (start at 2s, max 64s) with jitter
          const baseWait = Math.min(2000 * Math.pow(2, i), 64000);
          const jitter = Math.random() * 1000; // 0-1s random jitter
          waitTime = baseWait + jitter;
        } else {
          // For other errors: shorter backoff (1s, 2s, 4s, 8s, 16s)
          waitTime = 1000 * Math.pow(2, Math.min(i, 4));
        }
        
        const waitSeconds = (waitTime / 1000).toFixed(1);
        console.log(`⏳ Waiting ${waitSeconds}s before retry ${i + 2}/${retriesAllowed}...`);
        console.log(`💡 Tip: If this persists, the Gemini API may be experiencing temporary issues. Try again in a few minutes.`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // Provide helpful error message based on error type
  console.error('❌ All extraction attempts failed');
  
  if (is503Error) {
    const errorMsg = 'Google Generative AI service is experiencing high demand. ' +
                     'This is temporary - please try again in a few minutes. ' +
                     'If the issue persists, check your internet connection or API quota.';
    console.error('⚠️ ' + errorMsg);
    throw new Error(errorMsg);
  }
  
  throw lastError;
};


