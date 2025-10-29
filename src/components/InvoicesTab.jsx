import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { Trash2, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { updateInvoice, deleteInvoice } from '../redux/slices/invoiceSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const InvoicesTab = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoices.invoices);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (invoice) => {
    setEditingId(invoice.id);
    setEditForm(invoice);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    dispatch(updateInvoice(editForm));
    toast.success('Invoice updated successfully');
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      dispatch(deleteInvoice(id));
      toast.success('Invoice deleted');
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hasValidationErrors = (invoice) => {
    return invoice.validationErrors && invoice.validationErrors.length > 0;
  };

  const isFieldMissing = (invoice, field) => {
    return invoice.validationErrors?.includes(field);
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No invoices uploaded yet</p>
        <p className="text-gray-400 text-sm mt-2">Upload files to see invoice data here</p>
      </div>
    );
  }

  // Compute a small analysis summary from invoices for quick insights
  const totalValue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalTax = invoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);

  // Top customer by total purchase
  const customerTotals = invoices.reduce((map, inv) => {
    const name = inv.customerName || 'Unknown';
    map[name] = (map[name] || 0) + (inv.totalAmount || 0);
    return map;
  }, {});
  const topCustomer = Object.keys(customerTotals).reduce((best, k) => {
    if (!best) return k;
    return customerTotals[k] > customerTotals[best] ? k : best;
  }, null) || '';

  // Top product by quantity sold across all invoices
  const productTotals = invoices.reduce((map, inv) => {
    (inv.products || []).forEach((p) => {
      const name = p.name || p.productName || 'Unknown Product';
      map[name] = (map[name] || 0) + (p.quantity || 0);
    });
    return map;
  }, {});
  const topProduct = Object.keys(productTotals).reduce((best, k) => {
    if (!best) return k;
    return productTotals[k] > productTotals[best] ? k : best;
  }, null) || '';

  return (
    <div className="overflow-x-auto">
      {/* Summary card showing aggregated AI analysis */}
      <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-2 sm:mb-0">
          <p className="text-sm text-gray-500">Invoices</p>
          <p className="text-xl font-semibold text-gray-900">{invoices.length}</p>
        </div>

        <div className="mb-2 sm:mb-0">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-lg font-medium text-gray-900">₹{totalValue.toFixed(2)}</p>
        </div>

        <div className="mb-2 sm:mb-0">
          <p className="text-sm text-gray-500">Total Tax</p>
          <p className="text-lg font-medium text-gray-900">₹{totalTax.toFixed(2)}</p>
        </div>

        <div className="mb-2 sm:mb-0">
          <p className="text-sm text-gray-500">Top Customer</p>
          <p className="text-sm text-gray-800">{topCustomer || '-'}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Top Product</p>
          <p className="text-sm text-gray-800">{topProduct || '-'}</p>
        </div>
      </div>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Serial Number
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Customer Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Products
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Total Qty
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Tax
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {invoices.map((invoice) => {
            console.log('invoice data :',invoice);
            
            const isEditing = editingId === invoice.id;
            const currentData = isEditing ? editForm : invoice;
            const totalQty = invoice.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
            const productNames = invoice.products?.map(p => p.productName).join(', ') || '-';

            return (
              <tr
                key={invoice.id}
                className={`hover:bg-gray-50 ${hasValidationErrors(invoice) ? 'bg-red-50' : ''}`}
              >
                {/* Serial Number */}
                <td className={`px-4 py-3 ${isFieldMissing(invoice, 'serialNumber') ? 'validation-error' : ''}`}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData.serialNumber}
                      onChange={(e) => handleEditChange('serialNumber', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">
                      {invoice.serialNumber || <span className="validation-missing">Missing ⚠️</span>}
                    </span>
                  )}
                </td>

                {/* Customer Name */}
                <td className={`px-4 py-3 ${isFieldMissing(invoice, 'customerName') ? 'validation-error' : ''}`}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData.customerName}
                      onChange={(e) => handleEditChange('customerName', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    invoice.customerName || <span className="validation-missing">Missing ⚠️</span>
                  )}
                </td>

                {/* Products */}
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={productNames}>
                  {productNames}
                </td>

                {/* Total Quantity */}
                <td className="px-4 py-3 text-sm text-gray-900">{totalQty}</td>

                {/* Tax */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      value={currentData.taxAmount}
                      onChange={(e) => handleEditChange('taxAmount', parseFloat(e.target.value))}
                      className="border rounded px-2 py-1 w-24"
                    />
                  ) : (
                    <span className="text-gray-900">₹{invoice.taxAmount?.toFixed(2) || '0.00'}</span>
                  )}
                </td>

                {/* Total Amount */}
                <td className={`px-4 py-3 ${isFieldMissing(invoice, 'totalAmount') ? 'validation-error' : ''}`}>
                  {isEditing ? (
                    <input
                      type="number"
                      value={currentData.totalAmount}
                      onChange={(e) => handleEditChange('totalAmount', parseFloat(e.target.value))}
                      className="border rounded px-2 py-1 w-32"
                    />
                  ) : (
                    <span className="font-semibold text-gray-900">
                      {invoice.totalAmount ? `₹${invoice.totalAmount.toFixed(2)}` : <span className="validation-missing">Missing ⚠️</span>}
                    </span>
                  )}
                </td>

                {/* Date */}
                <td className={`px-4 py-3 ${isFieldMissing(invoice, 'date') ? 'validation-error' : ''}`}>
                  {isEditing ? (
                    <input
                      type="date"
                      value={currentData.date}
                      onChange={(e) => handleEditChange('date', e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    <span className="text-gray-600">
                      {invoice.date ? format(new Date(invoice.date), 'dd MMM yyyy') : <span className="validation-missing">Missing ⚠️</span>}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-800"
                          title="Save"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-800"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(invoice)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Missing Fields Warning */}
      {invoices.some(inv => hasValidationErrors(inv)) && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Missing Required Fields</p>
            <p className="text-xs text-yellow-700 mt-1">
              Some invoices have missing or incomplete data (highlighted in red). Please review and complete them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesTab;
