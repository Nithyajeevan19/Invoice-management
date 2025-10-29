import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  customers: [],
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    addCustomer: (state, action) => {
      const existingCustomer = state.customers.find(
        c => c.name.toLowerCase() === action.payload.name.toLowerCase()
      );
      
      if (existingCustomer) {
        // Update purchase amount if customer exists
        existingCustomer.totalPurchaseAmount += action.payload.totalPurchaseAmount || 0;
      } else {
        state.customers.push({
          ...action.payload,
          id: action.payload.id || uuidv4(),
        });
      }
    },
    
    addCustomers: (state, action) => {
      action.payload.forEach(customer => {
        const existingCustomer = state.customers.find(
          c => c.name.toLowerCase() === customer.name.toLowerCase()
        );
        
        if (existingCustomer) {
          existingCustomer.totalPurchaseAmount += customer.totalPurchaseAmount || 0;
        } else {
          state.customers.push({
            ...customer,
            id: customer.id || uuidv4(),
          });
        }
      });
    },
    
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = { ...state.customers[index], ...action.payload };
      }
    },
    
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
    },
    
    clearCustomers: (state) => {
      state.customers = [];
    },
    
    updateCustomerPurchaseAmount: (state, action) => {
      const { customerId, amount } = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        customer.totalPurchaseAmount = amount;
      }
    },
    
    setValidationErrors: (state, action) => {
      const { customerId, errors } = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        customer.validationErrors = errors;
      }
    },
  },
});

export const {
  addCustomer,
  addCustomers,
  updateCustomer,
  deleteCustomer,
  clearCustomers,
  updateCustomerPurchaseAmount,
  setValidationErrors,
} = customerSlice.actions;

export default customerSlice.reducer;
