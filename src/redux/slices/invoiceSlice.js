import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  invoices: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk for adding multiple invoices
export const addInvoicesAsync = createAsyncThunk(
  'invoices/addMultiple',
  async (invoicesData, { rejectWithValue }) => {
    try {
      // Add IDs and timestamps to invoices
      const processedInvoices = invoicesData.map(invoice => ({
        ...invoice,
        id: invoice.id || uuidv4(),
        createdAt: new Date().toISOString(),
        validationErrors: invoice.validationErrors || [],
        status: invoice.status || 'draft',
        taxBreakdown: invoice.taxBreakdown || {
          cgst: 0,
          sgst: 0,
          igst: 0,
          totalTax: 0,
        },
        sellerState: invoice.sellerState || 'KARNATAKA',
        buyerState: invoice.buyerState || '',
      }));
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
      state.invoices.push({
        ...action.payload,
        id: action.payload.id || uuidv4(),
        createdAt: new Date().toISOString(),
        status: action.payload.status || 'draft', // ADD STATUS
      });
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
      const { invoiceId, products } = action.payload;
      const invoice = state.invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        invoice.products = products;
        // Recalculate total
        invoice.totalAmount = products.reduce((sum, p) => sum + (p.amount || 0), 0);
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
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
