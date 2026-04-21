import { useSelector, useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { Trash2, Edit2, Save, X, AlertCircle, Search, Filter, RotateCcw, Download, DollarSign, Receipt, FileText } from 'lucide-react';
import { updateInvoice, deleteInvoice, updateInvoiceStatus } from '../redux/slices/invoiceSlice';
import { setInvoiceSearchTerm, setInvoiceAmountRange, setInvoiceDateRange, setInvoiceStatusFilter, resetInvoiceFilters } from '../redux/slices/filterSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { exportToExcel } from '../utils/exportToExcel';
import StatusBadge from './StatusBadge';
import PaymentModal from './PaymentModal';
import TaxBreakdown from './TaxBreakdown';
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PdfInvoice } from "./PdfInvoice";
import { Mail } from 'lucide-react';
import EmailModal from './EmailModal';
import UPIQRCode from './UPIQRCode';


const InvoicesTab = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoices.invoices);
  const filters = useSelector((state) => state.filters.invoiceFilters);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [emailModalInvoice, setEmailModalInvoice] = useState(null);


  // Apply filters
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.serialNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesAmount =
      (!filters.minAmount || invoice.totalAmount >= parseFloat(filters.minAmount)) &&
      (!filters.maxAmount || invoice.totalAmount <= parseFloat(filters.maxAmount));

    const invoiceDate = new Date(invoice.date);
    const matchesDate =
      (!filters.startDate || invoiceDate >= new Date(filters.startDate)) &&
      (!filters.endDate || invoiceDate <= new Date(filters.endDate));

    const matchesStatus = !filters.status || invoice.status === filters.status;

    return matchesSearch && matchesAmount && matchesDate && matchesStatus;
  });

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

  const totalValue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalTax = invoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);

  const customerTotals = invoices.reduce((map, inv) => {
    const name = inv.customerName || 'Unknown';
    map[name] = (map[name] || 0) + (inv.totalAmount || 0);
    return map;
  }, {});
  const topCustomer = Object.keys(customerTotals).reduce((best, k) => {
    if (!best) return k;
    return customerTotals[k] > customerTotals[best] ? k : best;
  }, null) || '';

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
      {/* Summary */}
      <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-2 sm:mb-0">
          <p className="text-sm text-gray-500">Invoices</p>
          <p className="text-xl font-semibold text-gray-900">{filteredInvoices.length}</p>
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

      {/* Search & Filter Bar */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col gap-3">
          {/* Search Input */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice number or customer name..."
                value={filters.searchTerm}
                onChange={(e) => dispatch(setInvoiceSearchTerm(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            {(filters.searchTerm || filters.minAmount || filters.maxAmount || filters.startDate || filters.endDate || filters.status) && (
              <button
                onClick={() => dispatch(resetInvoiceFilters())}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Reset
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
              {/* Amount Range */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Min Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => dispatch(setInvoiceAmountRange({ min: e.target.value, max: filters.maxAmount }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Max Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => dispatch(setInvoiceAmountRange({ min: filters.minAmount, max: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => dispatch(setInvoiceDateRange({ start: e.target.value, end: filters.endDate }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => dispatch(setInvoiceDateRange({ start: filters.startDate, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => dispatch(setInvoiceStatusFilter(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredInvoices.length}</span> of <span className="font-semibold text-gray-900">{invoices.length}</span> invoices
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => exportToExcel(filteredInvoices, "invoices_export.xlsx", "Invoices")}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="h-5 w-5 mr-1" />
          Export to Excel
        </button>
      </div>

      {/* Table */}
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Serial Number</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Products</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Qty</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tax</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Amount</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredInvoices.map((invoice) => {
            const isEditing = editingId === invoice.id;
            const currentData = isEditing ? editForm : invoice;
            const totalQty = invoice.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
            const productNames = invoice.products?.map(p => p.productName || p.name).join(', ') || '-';

            return (
              <React.Fragment key={invoice.id}>
                {/* MAIN INVOICE ROW */}
                <tr className={`hover:bg-gray-50 ${hasValidationErrors(invoice) ? 'bg-red-50' : ''}`}>
                  {/* Status Column */}
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={invoice.status || 'draft'}
                      onStatusChange={(newStatus) => {
                        dispatch(updateInvoiceStatus({ id: invoice.id, status: newStatus }));
                        toast.success(`Invoice marked as ${newStatus}`);
                      }}
                    />
                  </td>

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

                  {/* Total Qty */}
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
                          <button
                            onClick={() => setPaymentModalInvoice(invoice)}
                            className="text-green-600 hover:text-green-800"
                            title="Record Payment"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setExpandedInvoice(expandedInvoice === invoice.id ? null : invoice.id)}
                            className="text-purple-600 hover:text-purple-800"
                            title="View Tax Details"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>
                          <PDFDownloadLink
                            document={<PdfInvoice invoice={invoice} company={{
                              name: 'Your Company Name',
                              gstin: 'Your GSTIN',
                              address: 'Your Address',
                              phone: '1234567890'
                            }} />}
                            fileName={`invoice_${invoice.serialNumber || invoice.id}.pdf`}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {({ loading }) => (
                              <span title="Download Invoice PDF">
                                {loading ? '...' : <FileText className="h-4 w-4" />}
                              </span>
                            )}
                          </PDFDownloadLink>
                          <button
                            onClick={() => setEmailModalInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Send Invoice via Email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {/* TAX BREAKDOWN & UPI ROW (EXPANDABLE) */}
                {expandedInvoice === invoice.id && (
                  <tr className="bg-gray-50">
                    <td colSpan="9" className="px-4 py-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Tax Breakdown */}
                        <TaxBreakdown invoice={invoice} />
                        
                        {/* UPI QR Code */}
                        <UPIQRCode 
                          invoice={invoice} 
                          merchantInfo={{
                            upiId: 'merchant@paytm', // Replace with your UPI ID
                            name: 'Your Company Name',
                          }}
                  />
                      </div>
                      </td>
                    </tr>
                  )}

              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg mt-4">
          <p className="text-gray-500">No invoices match your filters</p>
        </div>
      )}

      {invoices.some(inv => hasValidationErrors(inv)) && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Missing Required Fields</p>
            <p className="text-xs text-yellow-700 mt-1">
              Some invoices have missing or incomplete data (highlighted in red).
            </p>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalInvoice && (
        <PaymentModal
          invoice={paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
        />
      )}
      {/* Email Modal */}
        {emailModalInvoice && (
          <EmailModal
            invoice={emailModalInvoice}
            onClose={() => setEmailModalInvoice(null)}
          />
        )}

    </div>
  );
};

export default InvoicesTab;
