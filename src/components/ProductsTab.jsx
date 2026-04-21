import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { Trash2, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { updateProduct, deleteProduct } from '../redux/slices/productSlice';
import toast from 'react-hot-toast';
import { exportToExcel } from '../utils/exportToExcel';
import { Download } from 'lucide-react';


const ProductsTab = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.products);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    dispatch(updateProduct(editForm));
    toast.success('Product updated! Changes synced to invoices.', { duration: 3000 });
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
      toast.success('Product deleted');
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hasValidationErrors = (product) => {
    return product.validationErrors && product.validationErrors.length > 0;
  };

  const isFieldMissing = (product, field) => {
    return product.validationErrors?.includes(field);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
        <p className="text-gray-400 text-sm mt-2">Upload invoice files to see product data</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      
      <button
        onClick={() => exportToExcel(products, "products_export.xlsx", "Products")}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-2"
      >
        <Download className="h-5 w-5 mr-1" />
        Export to Excel
      </button>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Unit Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Tax
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Price with Tax
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Discount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => {
            const isEditing = editingId === product.id;
            const currentData = isEditing ? editForm : product;

            return (
              <tr
                key={product.id}
                className={`hover:bg-gray-50 ${hasValidationErrors(product) ? 'bg-red-50' : ''}`}
              >
                {/* Name */}
                <td className={`px-4 py-3 ${isFieldMissing(product, 'name') ? 'validation-error' : ''}`}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">
                      {product.name || <span className="validation-missing">Missing ⚠️</span>}
                    </span>
                  )}
                </td>

                {/* Quantity */}
                <td className={`px-4 py-3 ${isFieldMissing(product, 'quantity') ? 'validation-error' : ''}`}>
                  {isEditing ? (
                    <input
                      type="number"
                      value={currentData.quantity}
                      onChange={(e) => handleEditChange('quantity', parseFloat(e.target.value))}
                      className="border rounded px-2 py-1 w-24"
                    />
                  ) : (
                    <span className="text-gray-900">
                      {product.quantity || <span className="validation-missing">Missing ⚠️</span>}
                    </span>
                  )}
                </td>

                {/* Unit Price */}
                <td className={`px-4 py-3 ${isFieldMissing(product, 'unitPrice') ? 'validation-error' : ''}`}>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={currentData.unitPrice}
                      onChange={(e) => handleEditChange('unitPrice', parseFloat(e.target.value))}
                      className="border rounded px-2 py-1 w-24"
                    />
                  ) : (
                    <span className="text-gray-900">
                      {product.unitPrice ? `₹${product.unitPrice.toFixed(2)}` : <span className="validation-missing">Missing ⚠️</span>}
                    </span>
                  )}
                </td>

                {/* Tax */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={currentData.tax}
                      onChange={(e) => handleEditChange('tax', parseFloat(e.target.value))}
                      className="border rounded px-2 py-1 w-24"
                    />
                  ) : (
                    <span className="text-gray-900">₹{product.tax?.toFixed(2) || '0.00'}</span>
                  )}
                </td>

                {/* Price with Tax */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={currentData.priceWithTax}
                      onChange={(e) => handleEditChange('priceWithTax', parseFloat(e.target.value))}
                      className="border rounded px-2 py-1 w-24"
                    />
                  ) : (
                    <span className="font-semibold text-gray-900">
                      ₹{product.priceWithTax?.toFixed(2) || '0.00'}
                    </span>
                  )}
                </td>

                {/* Discount */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={currentData.discount || 0}
                      onChange={(e) => handleEditChange('discount', parseFloat(e.target.value))}
                      className="border rounded px-2 py-1 w-24"
                    />
                  ) : (
                    <span className="text-gray-600">₹{product.discount?.toFixed(2) || '0.00'}</span>
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
                          onClick={() => startEdit(product)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
      {products.some(p => hasValidationErrors(p)) && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Missing Required Fields</p>
            <p className="text-xs text-yellow-700 mt-1">
              Some products have missing or incomplete data (highlighted in red). Please review and complete them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
