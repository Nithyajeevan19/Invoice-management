import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, CreditCard, DollarSign } from 'lucide-react';
import { addPayment } from '../redux/slices/paymentSlice';
import { updateInvoiceStatus } from '../redux/slices/invoiceSlice';
import toast from 'react-hot-toast';

const PaymentModal = ({ invoice, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    amount: invoice.totalAmount || 0,
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const payment = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.serialNumber,
      customerName: invoice.customerName,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      paymentDate: formData.paymentDate,
      reference: formData.reference,
      notes: formData.notes,
    };

    dispatch(addPayment(payment));
    
    // Auto-update invoice status to 'paid' if full payment
    if (parseFloat(formData.amount) >= invoice.totalAmount) {
      dispatch(updateInvoiceStatus({ id: invoice.id, status: 'paid' }));
    }

    toast.success('Payment recorded successfully!');
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Record Payment
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Invoice #{invoice.serialNumber}
          </p>
        </div>
      </div>
      <button 
        onClick={onClose} 
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <X className="h-6 w-6" />
      </button>
    </div>

    {/* Body */}
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {/* Invoice Details */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Customer:
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {invoice.customerName}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Invoice Amount:
          </span>
          <span className="text-xl font-bold text-green-600 dark:text-green-400">
            ₹{invoice.totalAmount?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Payment Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="number"
            step="0.01"
            required
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Payment Method <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.paymentMethod}
          onChange={(e) => handleChange('paymentMethod', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all cursor-pointer"
        >
          <option value="cash">💵 Cash</option>
          <option value="card">💳 Credit/Debit Card</option>
          <option value="upi">📱 UPI</option>
          <option value="bank_transfer">🏦 Bank Transfer</option>
          <option value="cheque">📝 Cheque</option>
        </select>
      </div>

      {/* Payment Date */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Payment Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          required
          value={formData.paymentDate}
          onChange={(e) => handleChange('paymentDate', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Reference Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Reference Number
          <span className="text-gray-400 font-normal ml-1">(Optional)</span>
        </label>
        <input
          type="text"
          value={formData.reference}
          onChange={(e) => handleChange('reference', e.target.value)}
          placeholder="Transaction ID, Cheque No, etc."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Notes
          <span className="text-gray-400 font-normal ml-1">(Optional)</span>
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows="3"
          placeholder="Any additional notes..."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-green-600 dark:bg-green-500 text-white font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-600 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Record Payment
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default PaymentModal;
