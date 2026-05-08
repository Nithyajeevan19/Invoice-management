import { useSelector, useDispatch } from 'react-redux';
import { Trash2, CreditCard, DollarSign } from 'lucide-react';
import { deletePayment } from '../paymentSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PaymentsTab = () => {
  const dispatch = useDispatch();
  const payments = useSelector((state) => state.payments.payments);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      dispatch(deletePayment(id));
      toast.success('Payment deleted');
    }
  };

  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const paymentMethodIcon = (method) => {
    const icons = {
      cash: '💵',
      card: '💳',
      upi: '📱',
      bank_transfer: '🏦',
      cheque: '📝',
    };
    return icons[method] || '💰';
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <CreditCard className="h-12 md:h-16 w-12 md:w-16 text-gray-400 mx-auto mb-3 md:mb-4" />
        <p className="text-gray-500 text-base md:text-lg">No payments recorded yet</p>
        <p className="text-gray-400 text-xs md:text-sm mt-2">Record payments from the Invoices tab</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      {/* Summary */}
      <div className="mb-3 md:mb-4 p-3 md:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">Total Payments</p>
            <p className="text-2xl md:text-3xl font-bold text-green-600">₹{totalPayments.toFixed(2)}</p>
          </div>
          <div className="p-2 md:p-4 bg-white rounded-full shadow-md">
            <DollarSign className="h-6 md:h-8 w-6 md:w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden text-sm md:text-base">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-700 uppercase">Payment Date</th>
            <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-700 uppercase">Invoice #</th>
            <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
            <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
            <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-700 uppercase">Method</th>
            <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-700 uppercase">Reference</th>
            <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                {payment.paymentDate ? format(new Date(payment.paymentDate), 'dd MMM yyyy') : '-'}
              </td>
              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-900">{payment.invoiceNumber}</td>
              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600">{payment.customerName}</td>
              <td className="px-3 md:px-4 py-2 md:py-3 text-sm md:text-lg font-semibold text-green-600">₹{payment.amount?.toFixed(2)}</td>
              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                <span className="inline-flex items-center gap-1">
                  <span>{paymentMethodIcon(payment.paymentMethod)}</span>
                  <span className="capitalize">{payment.paymentMethod?.replace('_', ' ')}</span>
                </span>
              </td>
              <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600">{payment.reference || '-'}</td>
              <td className="px-2 md:px-4 py-2 md:py-3">
                <button
                  onClick={() => handleDelete(payment.id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsTab;
