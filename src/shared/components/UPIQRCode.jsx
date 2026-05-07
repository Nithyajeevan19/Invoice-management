import { QRCodeSVG } from 'qrcode.react';
import { Download, Smartphone, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { generateInvoiceUPI } from '../utils/upiGenerator';
import toast from 'react-hot-toast';

const UPIQRCode = ({ invoice, merchantInfo }) => {
  const [copied, setCopied] = useState(false);

  // Generate UPI payment string
  const upiString = generateInvoiceUPI(invoice, merchantInfo);

  // Copy UPI ID to clipboard
  const copyUPIString = () => {
    navigator.clipboard.writeText(upiString);
    setCopied(true);
    toast.success('UPI payment link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download QR code as image
  const downloadQRCode = () => {
    const svg = document.getElementById(`upi-qr-${invoice.id}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `UPI_QR_${invoice.serialNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR Code downloaded!');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">UPI Payment</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* QR Code */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <QRCodeSVG
            id={`upi-qr-${invoice.id}`}
            value={upiString}
            size={200}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg",
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>

        {/* Info & Actions */}
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Scan to pay</p>
            <p className="text-2xl font-bold text-purple-600">₹{invoice.totalAmount?.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Pay to UPI ID:</p>
            <p className="text-sm font-mono font-medium text-gray-900">{merchantInfo.upiId}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyUPIString}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            
            <button
              onClick={downloadQRCode}
              className="flex items-center gap-2 px-3 py-2 bg-white text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 text-sm"
            >
              <Download className="h-4 w-4" />
              Download QR
            </button>
          </div>

          {/* Supported Apps */}
          <div className="text-xs text-gray-500">
            <p>Scan with any UPI app:</p>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-1 bg-white rounded border">PhonePe</span>
              <span className="px-2 py-1 bg-white rounded border">GPay</span>
              <span className="px-2 py-1 bg-white rounded border">Paytm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIQRCode;
