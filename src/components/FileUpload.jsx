import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { processFile, processMultipleFiles, formatFileSize } from '../services/fileProcessor';
import { addInvoicesAsync } from '../redux/slices/invoiceSlice';
import { addProducts } from '../redux/slices/productSlice';
import { addCustomers } from '../redux/slices/customerSlice';
import { setProcessing, setProgress, addUploadedFile } from '../redux/slices/fileSlice';
import toast from 'react-hot-toast';

const FileUpload = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processing, setProcessingState] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were skipped due to unsupported format');
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setProcessingState(true);
    dispatch(setProcessing(true));

    try {
      const onProgress = (progressData) => {
        setProgressState(progressData.progress);
        setCurrentStatus(progressData.message);
        dispatch(setProgress(progressData.progress));
      };

      let results;

      if (selectedFiles.length === 1) {
        // Single file processing
        const result = await processFile(selectedFiles[0], onProgress);
        results = { results: [result], errors: [] };
      } else {
        // Multiple files processing
        results = await processMultipleFiles(selectedFiles, onProgress);
      }

      // Dispatch data to Redux store
      for (const result of results.results) {
        const { data } = result;

        // Add invoices
        if (data.invoices && data.invoices.length > 0) {
          await dispatch(addInvoicesAsync(data.invoices));
        }

        // Add products
        if (data.products && data.products.length > 0) {
          dispatch(addProducts(data.products));
        }

        // Add customers
        if (data.customers && data.customers.length > 0) {
          dispatch(addCustomers(data.customers));
        }

        // Add to uploaded files list (include AI summary if provided)
        dispatch(addUploadedFile({
          fileName: result.fileName,
          fileType: result.fileType,
          invoiceCount: data.invoices?.length || 0,
          productCount: data.products?.length || 0,
          customerCount: data.customers?.length || 0,
          summary: data.summary || {},
        }));
      }

      // Show success message
      const totalInvoices = results.results.reduce((sum, r) => sum + (r.data.invoices?.length || 0), 0);
      const totalProducts = results.results.reduce((sum, r) => sum + (r.data.products?.length || 0), 0);
      const totalCustomers = results.results.reduce((sum, r) => sum + (r.data.customers?.length || 0), 0);

      toast.success(
        `Successfully processed ${results.results.length} file(s)!\n` +
        `Extracted: ${totalInvoices} invoices, ${totalProducts} products, ${totalCustomers} customers`,
        { duration: 5000 }
      );

      // Show errors if any
      if (results.errors && results.errors.length > 0) {
        results.errors.forEach((error) => {
          toast.error(`Failed to process ${error.fileName}: ${error.error}`);
        });
      }

      // Clear selected files
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setProcessingState(false);
      setProgressState(0);
      setCurrentStatus('');
      dispatch(setProcessing(false));
      dispatch(setProgress(0));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Invoice Files</h2>
        <p className="text-gray-600 mb-6">
          Upload Excel files (.xlsx, .xls), PDF documents, or images (JPEG, PNG, WEBP)
        </p>

        {/* Drag & Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls,.pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleChange}
            className="hidden"
          />

          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag and drop files here
          </p>
          <p className="text-sm text-gray-500 mb-4">or</p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={processing}
          >
            Browse Files
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Supported: Excel (.xlsx, .xls), PDF, Images (JPEG, PNG, WEBP)
          </p>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={processing}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpload}
              disabled={processing}
              className="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {processing ? 'Processing...' : `Upload ${selectedFiles.length} File(s)`}
            </button>
          </div>
        )}

        {/* Processing Status */}
        {processing && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <div className="flex items-center mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-sm font-medium text-blue-800">{currentStatus}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-700 mt-2">{progress}% complete</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
