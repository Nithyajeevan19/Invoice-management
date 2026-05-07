/**
 * Communication Service - Handles email and notification dispatching
 */

class EmailService {
  /**
   * Send invoice email to customer
   * @param {Object} params - Email parameters
   * @returns {Promise<Object>} Response object with status and message
   */
  async sendInvoiceEmail({ invoice, customerEmail, pdfBlob }) {
    this._validateInvoiceData(invoice, customerEmail);

    try {
      // In production, this would call EmailJS or AWS SES
      // For now, we simulate the process
      await this._simulateDelay(2000);

      const logData = {
        to: customerEmail,
        subject: `Invoice ${invoice.serialNumber} from Your Company`,
        amount: invoice.totalAmount,
        attachment: pdfBlob ? 'PDF attached' : 'No attachment',
      };

      console.log('📧 [CommunicationService] Dispatching Email:', logData);

      return {
        success: true,
        message: `Email successfully dispatched to ${customerEmail}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[CommunicationService] Error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(invoice, customerEmail) {
    if (!customerEmail) throw new Error('Customer email is required');

    await this._simulateDelay(1500);
    console.log(`⏰ [CommunicationService] Reminder sent for Invoice ${invoice.serialNumber}`);

    return {
      success: true,
      message: `Reminder sent to ${customerEmail}`,
    };
  }

  // Private helpers
  _validateInvoiceData(invoice, email) {
    if (!email) throw new Error('Recipient email is missing');
    if (!invoice?.serialNumber) throw new Error('Invoice identification (serial number) is missing');
  }

  _simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const emailService = new EmailService();

// Export as individual functions for backward compatibility if needed
export const sendInvoiceEmail = (params) => emailService.sendInvoiceEmail(params);
export const sendPaymentReminder = (inv, email) => emailService.sendPaymentReminder(inv, email);

