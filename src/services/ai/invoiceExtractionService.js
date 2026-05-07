/**
 * Test utilities for debugging invoice extraction
 * Usage in browser console: 
 *   - testExtraction.testWithBase64('data:image/jpeg;base64,..', 'image')
 *   - testExtraction.testWithFile(fileObject)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export const testExtraction = {
  // Initialize Gemini with API key from env
  getModel: () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY not set');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  },

  // Test extraction with base64 data (for images)
  testWithBase64: async (base64DataUrl, fileType = 'image') => {
    try {
      console.log('🧪 Starting test with base64 data...');
      
      // Extract base64 from data URL if needed
      const base64 = base64DataUrl.includes(',') 
        ? base64DataUrl.split(',')[1] 
        : base64DataUrl;

      const mimeType = fileType === 'image' ? 'image/jpeg' : 'application/pdf';
      
      const model = testExtraction.getModel();
      
      const parts = [
        {
          text: `Extract invoice data from this document. Return ONLY valid JSON with structure:
{
  "invoices": [{"serialNumber": "", "customerName": "", "date": "", "totalAmount": 0, "taxAmount": 0, "products": []}],
  "products": [{"name": "", "quantity": 0, "unitPrice": 0, "tax": 0, "priceWithTax": 0, "discount": 0}],
  "customers": [{"name": "", "phoneNumber": "", "email": "", "gstin": "", "address": "", "totalPurchaseAmount": 0}],
  "missingFields": {"invoices": [], "products": [], "customers": []}
}`
        },
        {
          inlineData: {
            data: base64,
            mimeType: mimeType,
          },
        },
      ];

      console.log('📤 Sending to Gemini Vision API...');
      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();
      
      console.log('📥 Raw response:', text);
      
      // Try to parse
      let cleanedText = text.trim();
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\n|\n```/g, '');
      }
      cleanedText = cleanedText.replace(/^```\s*|\s*```$/g, '').trim();
      
      console.log('🧹 Cleaned response:', cleanedText);
      
      const data = JSON.parse(cleanedText);
      console.log('✅ Parsed successfully:', data);
      
      return {
        success: true,
        data: data,
        rawResponse: text
      };
    } catch (error) {
      console.error('❌ Test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Test with actual file
  testWithFile: async (file) => {
    try {
      console.log('🧪 Starting test with file:', file.name);
      
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = async (e) => {
          try {
            const base64 = e.target.result.includes(',')
              ? e.target.result.split(',')[1]
              : e.target.result;
            
            const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
            const result = await testExtraction.testWithBase64(base64, fileType);
            resolve(result);
          } catch (error) {
            console.error('❌ File processing failed:', error);
            resolve({ success: false, error: error.message });
          }
        };
        
        reader.onerror = () => {
          console.error('❌ Failed to read file');
          resolve({ success: false, error: 'Failed to read file' });
        };
        
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('❌ Test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Test with sample data
  testWithSampleInvoice: async () => {
    try {
      console.log('🧪 Testing with sample invoice text...');
      
      const sampleText = `
INVOICE
Bill to:
Elon Musk
Really Good Company
elon@elon.com

Ship to:
Elon Musk
Really Good Company
elon@elon.com

Invoice Date: 1/2/2028
Due date: 1/02/2028
P.O. Number: 352

Description    Price    Total
Item 1         $100.00  $100.00
Item 2         $100.00  $100.00
Item 3         $100.00  $100.00
Item 4         $100.00  $100.00

SUB-TOTAL: $400.00
TAX(S): $00.00
DISCOUNT: $00.00
SHIPPING: $00.00
TOTAL AMOUNT: $400.00
AMOUNT PAID: $00.00
BALANCED DUE: $400.00

GSTIN: 29AABCT1332L000
      `;

      const model = testExtraction.getModel();
      const prompt = `
Extract invoice data from this document. Return ONLY valid JSON with structure:
{
  "invoices": [{"serialNumber": "", "customerName": "", "date": "", "totalAmount": 0, "taxAmount": 0, "products": []}],
  "products": [{"name": "", "quantity": 0, "unitPrice": 0, "tax": 0, "priceWithTax": 0, "discount": 0}],
  "customers": [{"name": "", "phoneNumber": "", "email": "", "gstin": "", "address": "", "totalPurchaseAmount": 0}],
  "missingFields": {"invoices": [], "products": [], "customers": []}
}

Data:
${sampleText}
      `;

      console.log('📤 Sending to Gemini...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📥 Raw response:', text);
      
      // Parse
      let cleanedText = text.trim();
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\n|\n```/g, '');
      }
      cleanedText = cleanedText.replace(/^```\s*|\s*```$/g, '').trim();
      
      const data = JSON.parse(cleanedText);
      console.log('✅ Extracted data:', data);
      
      return {
        success: true,
        data: data,
        rawResponse: text
      };
    } catch (error) {
      console.error('❌ Test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Make available globally in development
if (typeof window !== 'undefined') {
  window.testExtraction = testExtraction;
  console.log('🧪 Test utilities loaded. Use window.testExtraction in console.');
}

export default testExtraction;
