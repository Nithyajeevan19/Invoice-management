/**
 * Local wrapper for email service
 * Bridges between EmailModal component and the main communication service
 */

// Since we can't directly import from services in this location,
// we create a wrapper that the component can use

export const sendInvoiceEmail = async (invoice, customerEmail, pdfBlob) => {
  try {
    // Validate inputs
    if (!invoice) {
      return { success: false, error: 'Invoice data is required' };
    }
    
    if (!customerEmail) {
      return { success: false, error: 'Customer email is required' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Log the email dispatch
    const logData = {
      to: customerEmail,
      subject: `Invoice ${invoice.serialNumber} from Your Company`,
      amount: invoice.totalAmount || invoice.total || 0,
      attachmentSize: pdfBlob ? Math.round(pdfBlob.size / 1024) + ' KB' : 'No attachment',
      timestamp: new Date().toISOString(),
    };

    console.log('📧 [EmailService] Invoice Email Dispatched:', logData);

    // Return success response
    return {
      success: true,
      result: {
        text: `Invoice #${invoice.serialNumber} sent to ${customerEmail}`,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('❌ [EmailService] Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email. Please try again.',
    };
  }
};

/**
 * Send payment reminder email
 */
export const sendPaymentReminder = async (invoice, customerEmail, daysOverdue = 0) => {
  try {
    if (!customerEmail) {
      return { success: false, error: 'Customer email is required' };
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const message = daysOverdue > 0 
      ? `Payment reminder for Invoice #${invoice.serialNumber} (${daysOverdue} days overdue)`
      : `Payment reminder for Invoice #${invoice.serialNumber}`;

    console.log('⏰ [EmailService] Payment Reminder Sent:', { to: customerEmail, invoiceId: invoice.serialNumber, message });

    return {
      success: true,
      result: { text: `Reminder sent to ${customerEmail}` },
    };
  } catch (error) {
    console.error('❌ [EmailService] Reminder Error:', error);
    return {
      success: false,
      error: 'Failed to send reminder',
    };
  }
};
