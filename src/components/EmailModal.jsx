import { useState } from 'react';
import { X, Mail, Send, Loader, AlertCircle } from 'lucide-react';
import { sendInvoiceEmail } from '../utils/emailService';
import { pdf } from '@react-pdf/renderer';
import { PdfInvoice } from './PdfInvoice';
import toast from 'react-hot-toast';

const EmailModal = ({ invoice, onClose }) => {
  const [formData, setFormData] = useState({
    email: invoice.customerEmail || '',
    subject: `Invoice #${invoice.serialNumber} - ${invoice.customerName}`,
    message: `Dear ${invoice.customerName},\n\nPlease find attached your invoice #${invoice.serialNumber} for ₹${invoice.totalAmount?.toFixed(2)}.\n\nThank you for your business!\n\nBest regards,\nYour Company`,
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    // Validate email
    if (!formData.email) {
      setError('Please enter customer email');
      toast.error('Please enter customer email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      toast.error('Invalid email format');
      return;
    }

    setError('');
    setSending(true);
    
    try {
      // Generate PDF blob
      console.log('Generating PDF...');
      const pdfBlob = await pdf(
        <PdfInvoice 
          invoice={invoice} 
          company={{ 
            name: 'Your Company', 
            gstin: '29AABCT1332L000',
            address: 'Your Address',
            phone: '1234567890'
          }} 
        />
      ).toBlob();

      console.log('PDF generated, size:', pdfBlob.size);

      // Send email
      console.log('Sending email to:', formData.email);
      const result = await sendInvoiceEmail(invoice, formData.email, pdfBlob);
      
      console.log('Email result:', result);

      if (result.success) {
        toast.success(result.result.text || 'Invoice sent successfully! (Demo mode)');
        onClose();
      } else {
        setError(result.error || 'Failed to send email');
        toast.error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email send error:', error);
      setError(error.message || 'Failed to generate or send invoice');
      toast.error('Failed to send: ' + (error.message || 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Send Invoice</h2>
              <p className="text-sm text-gray-500">Invoice #{invoice.serialNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Demo Mode Warning */}
        <div className="mx-6 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-800">
            <p className="font-semibold">Demo Mode Active</p>
            <p>Email functionality is simulated. To enable real emails, configure EmailJS.</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Customer Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, email: e.target.value }));
                setError('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="customer@example.com"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Invoice Preview Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Invoice Details:</p>
            <p className="text-sm"><strong>Customer:</strong> {invoice.customerName}</p>
            <p className="text-sm"><strong>Amount:</strong> ₹{invoice.totalAmount?.toFixed(2)}</p>
            <p className="text-sm"><strong>Date:</strong> {invoice.date}</p>
            <p className="text-sm"><strong>Attachment:</strong> Invoice PDF will be attached</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !formData.email}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invoice
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
