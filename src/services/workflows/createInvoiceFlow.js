import { v4 as uuidv4 } from 'uuid';
import { calculateInvoiceGST } from '../finance/taxService';
import { sendInvoiceEmail } from '../communication/emailService';
import { generateInsights } from '../ai/insightsService';
import { addInvoice, setLoading, setError } from '../../features/invoices/invoiceSlice';

/**
 * Workflow for creating a new invoice
 * Handles tax calculation, data validation, persistence, and secondary actions (email, insights)
 */
export const createInvoiceFlow = async (invoiceData, dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // 1. Basic Validation
    if (!invoiceData.products || invoiceData.products.length === 0) {
      throw new Error('Invoice must have at least one product');
    }

    // 2. Data Enrichment
    const enrichedInvoice = {
      ...invoiceData,
      id: invoiceData.id || uuidv4(),
      createdAt: new Date().toISOString(),
      status: invoiceData.status || 'draft',
      sellerState: invoiceData.sellerState || 'KARNATAKA',
      buyerState: invoiceData.buyerState || '',
    };

    // 3. Tax Calculation
    const taxResults = calculateInvoiceGST(
      enrichedInvoice.products,
      enrichedInvoice.sellerState,
      enrichedInvoice.buyerState
    );

    const finalInvoice = {
      ...enrichedInvoice,
      products: taxResults.products,
      taxBreakdown: taxResults.summary,
      totalAmount: taxResults.summary.grandTotal,
    };

    // 4. Save to State
    dispatch(addInvoice(finalInvoice));

    // 5. Trigger Async Workflows (don't block the UI)
    // Email dispatch
    if (finalInvoice.customerEmail) {
      sendInvoiceEmail(finalInvoice).catch(err => 
        console.error('Failed to send email:', err)
      );
    }

    // Update Analytics/Insights
    generateInsights([finalInvoice]).catch(err => 
      console.error('Failed to generate insights:', err)
    );

    dispatch(setLoading(false));
    return { success: true, invoice: finalInvoice };

  } catch (error) {
    console.error('Create Invoice Flow Error:', error);
    dispatch(setError(error.message));
    dispatch(setLoading(false));
    return { success: false, error: error.message };
  }
};
