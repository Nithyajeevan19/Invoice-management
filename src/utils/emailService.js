/**
 * DEMO Email Service - Shows UI feedback without actual sending
 * Replace with EmailJS when you're ready for production
 */

/**
 * Send invoice email to customer (DEMO)
 * @param {Object} invoice - Invoice data
 * @param {string} customerEmail - Customer email address
 * @param {Blob} pdfBlob - PDF file as blob
 * @returns {Promise} Email send result
 */
export const sendInvoiceEmail = async (invoice, customerEmail, pdfBlob) => {
  // Validate inputs
  if (!customerEmail) {
    return { 
      success: false, 
      error: 'Customer email is required' 
    };
  }

  if (!invoice || !invoice.serialNumber) {
    return { 
      success: false, 
      error: 'Invalid invoice data' 
    };
  }

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Log details (would be actual email in production)
    console.log('📧 [DEMO MODE] Email Details:');
    console.log('To:', customerEmail);
    console.log('Invoice:', invoice.serialNumber);
    console.log('Amount:', invoice.totalAmount);
    console.log('PDF Size:', pdfBlob.size, 'bytes');
    
    // Simulate success
    return { 
      success: true, 
      result: { 
        status: 200, 
        text: `✅ Demo email sent to ${customerEmail}`,
        message: 'Email functionality is in DEMO mode. To enable real emails, configure EmailJS.' 
      } 
    };
  } catch (error) {
    console.error('Email error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email' 
    };
  }
};

/**
 * Send payment reminder (DEMO)
 */
export const sendPaymentReminder = async (invoice, customerEmail) => {
  if (!customerEmail) {
    return { 
      success: false, 
      error: 'Customer email is required' 
    };
  }

  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('⏰ [DEMO] Payment reminder sent to:', customerEmail);
  
  return { 
    success: true, 
    result: { 
      status: 200, 
      text: `✅ Reminder sent to ${customerEmail}` 
    } 
  };
};
