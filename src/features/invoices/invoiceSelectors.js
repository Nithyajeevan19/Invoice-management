import { createSelector } from '@reduxjs/toolkit';

const selectInvoicesState = (state) => state.invoices;

export const selectAllInvoices = createSelector(
  [selectInvoicesState],
  (invoicesState) => invoicesState.invoices
);

export const selectInvoiceLoading = createSelector(
  [selectInvoicesState],
  (invoicesState) => invoicesState.loading
);

export const selectInvoiceError = createSelector(
  [selectInvoicesState],
  (invoicesState) => invoicesState.error
);

export const selectInvoicesByStatus = (status) => createSelector(
  [selectAllInvoices],
  (invoices) => invoices.filter(invoice => invoice.status === status)
);

export const selectInvoiceById = (id) => createSelector(
  [selectAllInvoices],
  (invoices) => invoices.find(invoice => invoice.id === id)
);

export const selectInvoiceAnalytics = createSelector(
  [selectAllInvoices],
  (invoices) => {
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const pendingAmount = invoices
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      
    return {
      totalCount: invoices.length,
      totalAmount,
      paidAmount,
      pendingAmount,
      countByStatus: {
        draft: invoices.filter(inv => inv.status === 'draft').length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length,
      }
    };
  }
);
