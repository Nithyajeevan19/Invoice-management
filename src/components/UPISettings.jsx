import { useState } from 'react';
import { Save, Smartphone } from 'lucide-react';
import { validateUPIId } from '../utils/upiGenerator';
import toast from 'react-hot-toast';

const UPISettings = () => {
  const [upiId, setUpiId] = useState('merchant@paytm');
  const [merchantName, setMerchantName] = useState('Your Company');

  const handleSave = () => {
    if (!validateUPIId(upiId)) {
      toast.error('Invalid UPI ID format');
      return;
    }
    
    // Save to localStorage or backend
    localStorage.setItem('merchant_upi_id', upiId);
    localStorage.setItem('merchant_name', merchantName);
    toast.success('UPI settings saved!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold">UPI Payment Settings</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your UPI ID
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@paytm"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: username@bankname (e.g., merchant@paytm)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Merchant Name
          </label>
          <input
            type="text"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            placeholder="Your Company Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default UPISettings;
