import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  payments: [],
  lastUpdated: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    addPayment: (state, action) => {
      state.payments.push({
        ...action.payload,
        id: action.payload.id || uuidv4(),
        createdAt: new Date().toISOString(),
      });
      state.lastUpdated = new Date().toISOString();
    },

    updatePayment: (state, action) => {
      const index = state.payments.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.payments[index] = { ...state.payments[index], ...action.payload };
        state.lastUpdated = new Date().toISOString();
      }
    },

    deletePayment: (state, action) => {
      state.payments = state.payments.filter(p => p.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },

    clearPayments: (state) => {
      state.payments = [];
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const { addPayment, updatePayment, deletePayment, clearPayments } = paymentSlice.actions;
export default paymentSlice.reducer;
