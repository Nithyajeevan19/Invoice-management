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
    
    console.log('📄 Extracting data from file:', {
      type: fileType,
      hasFileData: !!fileData,
      contentLength: fileContent?.length || 0,
      contentPreview: fileContent?.substring(0, 100) + '...'
    });
    
    if ((fileType === 'image' || fileType === 'pdf') && fileData) {
      const parts = [
        { text: prompt },
        {
          inlineData: {
            data: fileData,
            mimeType: fileType === 'pdf' ? 'application/pdf' : 'image/jpeg',
          },
        },
      ];
      console.log('🖼️ Processing with vision API:', {
        fileType,
        promptLength: prompt.length,
        base64Length: fileData?.length || 0
      });
      result = await model.generateContent(parts);
    } else {
      console.log('📝 Processing text content:', {
        promptLength: prompt.length,
        contentType: fileType
      });
      result = await model.generateContent(prompt);
    }
    
    const response = await result.response;
    let text = response.text();
    
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
        console.warn('No data extracted, checking raw content...');
        
        // Log the first 500 characters of raw content for debugging
        console.log('Raw content preview:', fileContent.substring(0, 500));
        
        // Try deterministic parsing as fallback
        const extracted = deterministicParse(fileContent);
        if (extracted.hasData) {
          console.log('Found data using deterministic parser');
          return extracted.data;
        }
        
        throw new Error('No invoice data could be extracted from the content');
      }
      
      return data;
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.log('Raw response:', text);
      throw new Error('Invalid JSON response from Gemini: ' + parseError.message);
    }
  } catch (error) {
    console.error('Extraction error:', error);
    throw error;
  }
};



export const extractWithRetry = async (fileContent, fileType, fileData = null) => {
  const maxRetries = 3;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Extraction attempt ${i + 1}/${maxRetries}`);
      const result = await extractInvoiceData(fileContent, fileType, fileData);

      console.log('Extraction successful!',result);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed:`, error.message);
      
      if (i < maxRetries - 1) {
        const waitTime = 1000 * Math.pow(2, i);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error('All extraction attempts failed');
  throw lastError;
};


