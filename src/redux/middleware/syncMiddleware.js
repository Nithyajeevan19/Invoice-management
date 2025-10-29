import { updateInvoiceProducts, updateInvoiceCustomer } from '../slices/invoiceSlice';
import { updateCustomerPurchaseAmount } from '../slices/customerSlice';

/**
 * Middleware to sync changes across Redux slices
 * When Products or Customers are updated, this updates related Invoices
 */
const syncMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Sync product name changes to invoices
  if (action.type === 'products/updateProduct') {
    const state = store.getState();
    const updatedProduct = action.payload;
    
    state.invoices.invoices.forEach((invoice) => {
      const updatedProducts = invoice.products.map((product) => {
        if (product.productId === updatedProduct.id) {
          return {
            ...product,
            productName: updatedProduct.name,
            unitPrice: updatedProduct.unitPrice,
            tax: updatedProduct.tax,
            priceWithTax: updatedProduct.priceWithTax,
          };
        }
        return product;
      });
      
      if (JSON.stringify(updatedProducts) !== JSON.stringify(invoice.products)) {
        store.dispatch(updateInvoiceProducts({
          invoiceId: invoice.id,
          products: updatedProducts,
        }));
      }
    });
  }
  
  // Sync customer name changes to invoices
  if (action.type === 'customers/updateCustomer') {
    const updatedCustomer = action.payload;
    store.dispatch(updateInvoiceCustomer({
      customerId: updatedCustomer.id,
      customerName: updatedCustomer.name,
    }));
  }
  
  // Recalculate customer total purchase when invoices change
  if (
    action.type === 'invoices/addInvoice' ||
    action.type === 'invoices/updateInvoice' ||
    action.type === 'invoices/deleteInvoice' ||
    action.type === 'invoices/addInvoicesAsync/fulfilled'
  ) {
    const state = store.getState();
    const customerTotals = {};
    
    state.invoices.invoices.forEach((invoice) => {
      if (invoice.customerId) {
        customerTotals[invoice.customerId] = 
          (customerTotals[invoice.customerId] || 0) + (invoice.totalAmount || 0);
      }
    });
    
    Object.entries(customerTotals).forEach(([customerId, total]) => {
      store.dispatch(updateCustomerPurchaseAmount({
        customerId,
        amount: total,
      }));
    });
  }
  
  return result;
};

export default syncMiddleware;
