# Invoice Data Extraction - Complete Debug & Setup Guide

## 🚀 Quick Start - Test Your Setup

### Step 1: Open Browser Console (F12)
1. Open your Invoice Management app in browser
2. Press `F12` to open DevTools
3. Click on the **Console** tab

### Step 2: Test API Connectivity
Run this command in the console:
```javascript
const result = await window.testExtraction.testWithSampleInvoice();
console.log(result);
```

**What to expect:**
- ✅ `success: true` = API is working
- ❌ `success: false` = Check error message

If you get `VITE_GEMINI_API_KEY not set`, your API key isn't configured. See **Setup** section below.

---

## 🔧 Setup Instructions

### Prerequisites
1. **Google Gemini API Key**
   - Go to: https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy your API key

2. **Environment Variables**
   - Create `.env` file in project root (next to `package.json`)
   - Add: `VITE_GEMINI_API_KEY=your_api_key_here`
   - Restart dev server

### Verify Setup
```javascript
// In console:
console.log('API Key configured:', import.meta.env.VITE_GEMINI_API_KEY ? '✅ YES' : '❌ NO');
```

---

## 📊 How Extraction Works

### Step 1: File Upload
- Excel files → Parsed to text/rows
- PDFs → Converted to base64
- Images (JPEG/PNG/WebP) → Converted to base64

### Step 2: Intelligent Strategy Selection
```
Text available? 
  ├─ YES → Send text to Gemini (faster, preferred)
  └─ NO → Use Vision API with image/PDF (slower)
```

### Step 3: Gemini API Call
- Sends prompt + file content/image
- Returns JSON with: invoices, products, customers
- Retries automatically if 503 error

### Step 4: Data Validation & Storage
- Validates extracted data
- Stores in Redux store
- Displays in UI tabs

---

## 🧪 Testing Extraction

### Test 1: Sample Invoice (Easiest)
Tests if API works without uploading:
```javascript
const result = await window.testExtraction.testWithSampleInvoice();
if (result.success) {
  console.log('✅ Extraction works!', result.data);
} else {
  console.log('❌ Failed:', result.error);
}
```

### Test 2: Real Invoice File
Upload your invoice in the app and watch console:

**Look for these logs:**
```
📄 Extraction strategy: {
  useVisionAPI: true/false,
  textLength: number,
  base64Length: number
}

🎯 Raw Gemini response: {
  length: number,
  preview: "..."
}

✅ Data extraction successful - found:
  invoices: X
  products: Y
  customers: Z
```

### Test 3: Manual Test with Base64
If you have base64 image data:
```javascript
const base64 = "iVBORw0KGgoAAAANSUhEUgAA..."; // your base64
const result = await window.testExtraction.testWithBase64(base64, 'image');
console.log(result);
```

---

## 🐛 Troubleshooting

### Issue: "VITE_GEMINI_API_KEY not set"

**Solution:**
1. Create `.env` file in project root
2. Add line: `VITE_GEMINI_API_KEY=<your_key>`
3. Restart dev server (`npm run dev`)
4. Hard refresh browser (Ctrl+Shift+R)

### Issue: "Service Unavailable (503)"

**Why:** Google Gemini API is experiencing high demand

**Solution:**
- System automatically retries 10 times with delays
- Wait 2-5 minutes and try again
- Check: https://status.cloud.google.com/

**Check logs:**
```
⚠️ Detected API high demand (503). Increasing retries to 10 attempts.
⏳ Waiting Xs before retry X/10...
```

### Issue: Uploaded but showing "Missing" data

**This means:** Extraction ran but returned empty arrays

**Debug steps:**
```javascript
// 1. Check API works with sample
const test = await window.testExtraction.testWithSampleInvoice();
console.log('Sample test:', test.success ? '✅' : '❌');

// 2. Upload invoice and check console for:
// "🎯 Raw Gemini response: {"invoices":[],...}"
// If empty, invoice image quality might be poor
```

**Possible causes:**
- Invoice image too blurry or small
- Invoice has unusual format Gemini doesn't recognize
- API response is empty (check logs)

**Try these:**
1. Use clearer, brighter image
2. Use different invoice format (PDF instead of image)
3. Check invoice has clear text/numbers
4. Try sample invoice test first

### Issue: Upload hangs or takes very long

**Why:** Network issue or large file

**Check console:**
```
📄 Image processed: { sizeInMB: X.XX }
🔄 Extraction attempt 1/5...
```

**Solutions:**
1. Check internet connection
2. Reduce image size (compress before upload)
3. Check browser DevTools Network tab for errors
4. Try with smaller file

### Issue: JSON parsing error

**Example log:**
```
❌ Failed to parse Gemini response as JSON
Error: Unexpected token...
Raw response: "Some text that's not JSON"
```

**Solution:**
- This means Gemini returned non-JSON response
- Usually temporary - wait and retry
- Check API quota: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/usage

---

## 📋 Expected Console Output - Happy Path

When everything works, you should see:

```
📄 PDF processed: {
  fileName: "invoice.pdf",
  fileSize: 54321,
  base64Length: 72428,
  sizeInMB: "0.05"
}

🔄 Processing: {
  fileType: "pdf",
  fileName: "invoice.pdf",
  size: 54321,
  hasText: false,
  hasBase64: true
}

📄 Extraction strategy: {
  fileType: "pdf",
  hasTextContent: false,
  useVisionAPI: true,
  textContentLength: 0,
  base64Length: 72428
}

🖼️ Using Vision API: {
  fileType: "pdf",
  promptLength: 3142,
  base64Length: 72428
}

🎯 Raw Gemini response: {
  length: 482,
  preview: "{\"invoices\":[{\"serialNumber\":\"INV-001\"..."
}

✅ Data extraction successful - found:
  invoices: 1
  products: 4
  customers: 1

✅ Extraction successful! {
  invoices: [...],
  products: [...],
  customers: [...]
}
```

---

## 📈 Performance Tips

1. **Use Text Format When Possible**
   - Excel files → Very fast
   - PDFs with selectable text → Fast
   - Images → Slower (Vision API)

2. **Image Quality**
   - High resolution (600+ DPI)
   - Good lighting
   - Clear, sharp text
   - No watermarks/stamps

3. **File Size**
   - Images < 1 MB preferred
   - Compress large images before uploading
   - PDFs ideally < 5 MB

---

## 🔍 Advanced Debugging

### Enable Detailed Logging
In console, check for these patterns:

```javascript
// Find all extraction logs
const logs = console.log;
console.filterExtraction = (msg) => {
  if (msg.includes('Extraction') || msg.includes('📄') || msg.includes('✅')) {
    console.log(msg);
  }
}
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter: `generativelanguage`
4. Upload invoice
5. Click the API request
6. Check **Response** tab for actual data returned

### Monitor Redux Store
```javascript
// In console:
import { store } from './redux/store.js'
const state = store.getState();
console.log('Customers:', state.customers.customers);
console.log('Invoices:', state.invoices.invoices);
```

---

## ✅ Verification Checklist

Before reporting an issue, verify:

- [ ] `.env` file created with `VITE_GEMINI_API_KEY`
- [ ] Dev server restarted after `.env` changes
- [ ] Browser hard-refreshed (Ctrl+Shift+R)
- [ ] Test utility works: `window.testExtraction.testWithSampleInvoice()`
- [ ] Checked console for detailed error logs
- [ ] Tried with different invoice format (image vs PDF)
- [ ] Invoice image is clear and readable
- [ ] Internet connection is stable
- [ ] API key quota not exceeded

---

## 📞 Getting Help

When reporting issues, include:

1. **Error message from console**
2. **Full log output** (copy from console)
3. **File type** (JPEG, PDF, Excel)
4. **File size**
5. **Result of:** `window.testExtraction.testWithSampleInvoice()`
6. **Browser** and **OS** version
7. **Screenshot** of console error

---

## 🔄 Manual Retry

If upload fails with 503:

```javascript
// Re-upload the same file (system will retry automatically)
// System will wait and retry up to 10 times
// Watch console for: "⏳ Waiting Xs before retry..."
```

---

## 📚 Reference

### Test Utility Methods

```javascript
// Test with sample invoice text (fastest)
await window.testExtraction.testWithSampleInvoice()

// Test with base64 image data
await window.testExtraction.testWithBase64(base64String, 'image')

// Test with file object
await window.testExtraction.testWithFile(fileObject)
```

### Key Files Modified

- `src/services/geminiService.js` - Extraction logic
- `src/services/fileProcessor.js` - File processing
- `src/services/pdfParser.js` - PDF handling
- `src/utils/testExtraction.js` - Test utilities
- `src/components/FileUpload.jsx` - UI error messages

---

## 💡 Pro Tips

1. **Always test API first** before uploading files
2. **Check console logs** - they tell you exactly what happened
3. **Use sample invoice test** to isolate issues
4. **Hard refresh** (Ctrl+Shift+R) after env changes
5. **Clear browser cache** if things act weird: Settings → Privacy → Clear cache

---

Last Updated: May 4, 2026
