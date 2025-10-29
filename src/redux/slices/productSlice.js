import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  products: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const existingProduct = state.products.find(
        p => p.name.toLowerCase() === action.payload.name.toLowerCase()
      );
      
      if (existingProduct) {
        // Update quantity if product exists
        existingProduct.quantity += action.payload.quantity || 0;
      } else {
        state.products.push({
          ...action.payload,
          id: action.payload.id || uuidv4(),
        });
      }
    },
    
    addProducts: (state, action) => {
      action.payload.forEach(product => {
        const existingProduct = state.products.find(
          p => p.name.toLowerCase() === product.name.toLowerCase()
        );
        
        if (existingProduct) {
          existingProduct.quantity += product.quantity || 0;
        } else {
          state.products.push({
            ...product,
            id: product.id || uuidv4(),
          });
        }
      });
    },
    
    updateProduct: (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...action.payload };
      }
    },
    
    deleteProduct: (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    
    clearProducts: (state) => {
      state.products = [];
    },
    
    setValidationErrors: (state, action) => {
      const { productId, errors } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (product) {
        product.validationErrors = errors;
      }
    },
  },
});

export const {
  addProduct,
  addProducts,
  updateProduct,
  deleteProduct,
  clearProducts,
  setValidationErrors,
} = productSlice.actions;

export default productSlice.reducer;
