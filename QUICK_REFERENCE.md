# 🚀 Quick Reference Card - Invoice Extraction

## 🏃 30 Second Setup

1. **Create `.env` file** in project root (next to package.json)
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

2. **Restart dev server**
   ```bash
   npm run dev
   ```

3. **Hard refresh browser**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

## 🧪 Test in 10 Seconds

Open browser console (F12) and run:
```javascript
await window.testExtraction.testWithSampleInvoice()
```

✅ Works = All set!  
❌ Error = Check API key

## 📤 Upload Invoice

1. Click "Upload Files"
2. Select image (JPEG/PNG) or PDF
3. Watch console for logs
4. Check data in tabs

## 🎯 What to Look For

| Success | Error |
|---------|-------|
| ✅ "Extraction successful" | ❌ "503 Service Unavailable" |
| ✅ Shows customer data | ❌ All fields "Missing" |
| ✅ Populated tabs | ❌ Empty tabs |

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| "API key not set" | Create `.env` with VITE_GEMINI_API_KEY |
| "Service Unavailable" | Wait 2-5 min, system auto-retries |
| "Missing" data | Try clearer image or PDF format |
| "Hangs" | Check file size, compress if needed |

## 💻 Useful Console Commands

```javascript
// Test API
window.testExtraction.testWithSampleInvoice()

// Check Redux data
store.getState().customers.customers
store.getState().invoices.invoices
store.getState().products.products

// Get API key status
import.meta.env.VITE_GEMINI_API_KEY
```

## 📋 Files Changed (7)

```
✅ src/services/geminiService.js          (extraction logic)
✅ src/services/fileProcessor.js          (file handling)
✅ src/services/pdfParser.js              (PDF support)
✅ src/services/imageParser.js            (image support)
✅ src/components/FileUpload.jsx          (error UI)
✅ src/main.jsx                           (test utils)
✨ src/utils/testExtraction.js            (NEW utilities)
```

## 📚 Full Guides

- **Detailed Debugging**: See `EXTRACTION_DEBUG_GUIDE.md`
- **Complete Summary**: See `EXTRACTION_FIX_SUMMARY.md`
- **Troubleshooting**: Check console logs with 📄, ✅, ❌ emojis

## ⚡ TL;DR

1. Add `.env` with API key
2. Restart server
3. Test: `window.testExtraction.testWithSampleInvoice()`
4. Upload invoice
5. Check console logs
6. Data should appear in tabs

---

**Need help?** Check the console logs - they explain everything with emojis!

