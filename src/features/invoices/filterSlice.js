import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoiceFilters: {
    searchTerm: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    status: '', // ADD THIS
  },
  productFilters: {
    searchTerm: '',
    minPrice: '',
    maxPrice: '',
  },
  customerFilters: {
    searchTerm: '',
    minPurchase: '',
    maxPurchase: '',
  },
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Invoice filters
    setInvoiceSearchTerm: (state, action) => {
      state.invoiceFilters.searchTerm = action.payload;
    },
    setInvoiceAmountRange: (state, action) => {
      state.invoiceFilters.minAmount = action.payload.min;
      state.invoiceFilters.maxAmount = action.payload.max;
    },
    setInvoiceDateRange: (state, action) => {
      state.invoiceFilters.startDate = action.payload.start;
      state.invoiceFilters.endDate = action.payload.end;
    },
    setInvoiceStatusFilter: (state, action) => {
      state.invoiceFilters.status = action.payload;
    },
    resetInvoiceFilters: (state) => {
      state.invoiceFilters = initialState.invoiceFilters;
    },

    // Product filters
    setProductSearchTerm: (state, action) => {
      state.productFilters.searchTerm = action.payload;
    },
    setProductPriceRange: (state, action) => {
      state.productFilters.minPrice = action.payload.min;
      state.productFilters.maxPrice = action.payload.max;
    },
    resetProductFilters: (state) => {
      state.productFilters = initialState.productFilters;
    },

    // Customer filters
    setCustomerSearchTerm: (state, action) => {
      state.customerFilters.searchTerm = action.payload;
    },
    setCustomerPurchaseRange: (state, action) => {
      state.customerFilters.minPurchase = action.payload.min;
      state.customerFilters.maxPurchase = action.payload.max;
    },
    resetCustomerFilters: (state) => {
      state.customerFilters = initialState.customerFilters;
    },
  },
});

export const {
  setInvoiceSearchTerm,
  setInvoiceAmountRange,
  setInvoiceDateRange,
  setInvoiceStatusFilter, // ADD THIS
  resetInvoiceFilters,
  setProductSearchTerm,
  setProductPriceRange,
  resetProductFilters,
  setCustomerSearchTerm,
  setCustomerPurchaseRange,
  resetCustomerFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
