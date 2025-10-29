import { configureStore } from '@reduxjs/toolkit';
import invoiceReducer from './slices/invoiceSlice';
import productReducer from './slices/productSlice';
import customerReducer from './slices/customerSlice';
import fileReducer from './slices/fileSlice';
import syncMiddleware from './middleware/syncMiddleware';

export const store = configureStore({
  reducer: {
    invoices: invoiceReducer,
    products: productReducer,
    customers: customerReducer,
    files: fileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore file objects in actions
        ignoredActions: ['files/uploadFile'],
        ignoredPaths: ['files.currentFile'],
      },
    }).concat(syncMiddleware),
});
