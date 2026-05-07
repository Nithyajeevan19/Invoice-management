import { configureStore } from '@reduxjs/toolkit';
import invoiceReducer from '../features/invoices/invoiceSlice';
import productReducer from '../features/products/productSlice';
import customerReducer from '../features/customers/customerSlice';
import fileReducer from '../features/invoices/fileSlice';
import filterReducer from '../features/invoices/filterSlice'; 
import paymentReducer from '../features/payments/paymentSlice';
import syncMiddleware from './middleware/syncMiddleware';

export const store = configureStore({
  reducer: {
    invoices: invoiceReducer,
    products: productReducer,
    customers: customerReducer,
    files: fileReducer,
    filters: filterReducer,
    payments: paymentReducer, 
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

