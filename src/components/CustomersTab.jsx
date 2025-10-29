import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { Trash2, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { updateCustomer, deleteCustomer } from '../redux/slices/customerSlice';
import toast from 'react-hot-toast';

const CustomersTab = () => {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers.customers);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (customer) => {
    setEditingId(customer.id);
    setEditForm(customer);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    dispatch(updateCustomer(editForm));
    toast.success('Customer updated! Changes synced to invoices.', { duration: 3000 });
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      dispatch(deleteCustomer(id));
      toast.success('Customer deleted');
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hasValidationErrors = (customer) => {
    return customer.validationErrors && customer.validationErrors.length > 0;
  };

  const isFieldMissing = (customer, field) => {
    return customer.validationErrors?.includes(field);
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No customers found</p>
        <p className="text-gray-400 text-sm mt-2">Upload invoice files to see customer data</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Customer Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Phone Number
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              GSTIN
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Address
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Total Purchase Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {customers.map((customer) => {
            const isEditing = editingId === customer.id;
            const currentData = isEditing ? editForm : customer;

            return (
              <tr
                key={customer.id}
                className={`hover:bg-gray-50 ${hasValidationErrors(customer) ? 'bg-red-50' : ''}`}
              >
                {/* Customer Name */}
                <td className={`px-4 py-3 ${isFieldMissing(customer, 'name') ? 'validation-error' : ''}`}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">
                      {customer.name || <span className="validation-missing">Missing ⚠️</span>}
                    </span>
                  )}
                </td>

                {/* Phone Number */}
                <td className={`px-4 py-3 ${isFieldMissing(customer, 'phoneNumber') ? 'validation-error' : ''}`}>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={currentData.phoneNumber}
                      onChange={(e) => handleEditChange('phoneNumber', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="text-gray-900">
                      {customer.phoneNumber || <span className="validation-missing">Missing ⚠️</span>}
                    </span>
                  )}
                </td>

                {/* Email */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="email"
                      value={currentData.email || ''}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="text-gray-600">{customer.email || '-'}</span>
                  )}
                </td>

                {/* GSTIN */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData.gstin || ''}
                      onChange={(e) => handleEditChange('gstin', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="text-gray-600 text-sm">{customer.gstin || '-'}</span>
                  )}
                </td>

                {/* Address */}
                <td className="px-4 py-3 max-w-xs">
                  {isEditing ? (
                    <textarea
                      value={currentData.address || ''}
                      onChange={(e) => handleEditChange('address', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                      rows="2"
                    />
                  ) : (
                    <span className="text-gray-600 text-sm">{customer.address || '-'}</span>
                  )}
                </td>

                {/* Total Purchase Amount */}
                <td className={`px-4 py-3 ${isFieldMissing(customer, 'totalPurchaseAmount') ? 'validation-error' : ''}`}>
                  <span className="font-semibold text-gray-900">
                    {customer.totalPurchaseAmount ? `₹${customer.totalPurchaseAmount.toFixed(2)}` : <span className="validation-missing">Missing ⚠️</span>}
                  </span>
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
                          onClick={() => startEdit(customer)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
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
      {customers.some(c => hasValidationErrors(c)) && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Missing Required Fields</p>
            <p className="text-xs text-yellow-700 mt-1">
              Some customers have missing or incomplete data (highlighted in red). Please review and complete them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTab;
