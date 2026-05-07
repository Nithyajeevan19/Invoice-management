import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  invoices: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk for adding multiple invoices
export const addInvoicesAsync = createAsyncThunk(
  'invoices/addMultiple',
  async (processedInvoices, { rejectWithValue }) => {
    try {
      // Logic for processing should happen in the service/workflow layer
      return processedInvoices;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    addInvoice: (state, action) => {
      state.invoices.push(action.payload);
      state.lastUpdated = new Date().toISOString();
    },

    updateInvoice: (state, action) => {
      const index = state.invoices.findIndex(inv => inv.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = { ...state.invoices[index], ...action.payload };
        state.lastUpdated = new Date().toISOString();
      }
    },

    updateInvoiceStatus: (state, action) => {
      const invoice = state.invoices.find(inv => inv.id === action.payload.id);
      if (invoice) {
        invoice.status = action.payload.status;
        state.lastUpdated = new Date().toISOString();
      }
    },

    deleteInvoice: (state, action) => {
      state.invoices = state.invoices.filter(inv => inv.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },

    updateInvoiceProducts: (state, action) => {
      const { invoiceId, products, totalAmount } = action.payload;
      const invoice = state.invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        invoice.products = products;
        invoice.totalAmount = totalAmount;
        state.lastUpdated = new Date().toISOString();
      }
    },

    updateInvoiceCustomer: (state, action) => {
      const { customerId, customerName } = action.payload;
      state.invoices.forEach(invoice => {
        if (invoice.customerId === customerId) {
          invoice.customerName = customerName;
        }
      });
      state.lastUpdated = new Date().toISOString();
    },

    clearInvoices: (state) => {
      state.invoices = [];
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },

    setValidationErrors: (state, action) => {
      const { invoiceId, errors } = action.payload;
      const invoice = state.invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        invoice.validationErrors = errors;
      }
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(addInvoicesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInvoicesAsync.fulfilled, (state, action) => {
        state.invoices.push(...action.payload);
        state.loading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addInvoicesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceProducts,
  updateInvoiceCustomer,
  clearInvoices,
  updateInvoiceStatus,
  setValidationErrors,
  setLoading,
  setError
} = invoiceSlice.actions;

export default invoiceSlice.reducer;

