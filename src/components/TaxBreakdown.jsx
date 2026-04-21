import { Receipt, TrendingUp } from 'lucide-react';

const TaxBreakdown = ({ invoice }) => {
  const { taxBreakdown = {} } = invoice;
  const { cgst = 0, sgst = 0, igst = 0, totalTax = 0 } = taxBreakdown;
  const isInterState = igst > 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">GST Breakdown</h3>
      </div>

      <div className="space-y-2">
        {isInterState ? (
          <>
            {/* IGST */}
            <div className="flex justify-between items-center p-2 bg-white rounded">
              <div>
                <span className="text-sm font-medium text-gray-700">IGST</span>
                <span className="text-xs text-gray-500 ml-2">(Inter-State)</span>
              </div>
              <span className="text-sm font-bold text-blue-600">₹{igst.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <>
            {/* CGST */}
            <div className="flex justify-between items-center p-2 bg-white rounded">
              <span className="text-sm font-medium text-gray-700">CGST</span>
              <span className="text-sm font-bold text-green-600">₹{cgst.toFixed(2)}</span>
            </div>

            {/* SGST */}
            <div className="flex justify-between items-center p-2 bg-white rounded">
              <span className="text-sm font-medium text-gray-700">SGST</span>
              <span className="text-sm font-bold text-green-600">₹{sgst.toFixed(2)}</span>
            </div>
          </>
        )}

        {/* Total Tax */}
        <div className="flex justify-between items-center p-2 bg-blue-100 rounded border-t-2 border-blue-300 mt-2">
          <span className="text-sm font-semibold text-gray-800">Total Tax</span>
          <span className="text-lg font-bold text-blue-700">₹{totalTax.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        <span>{isInterState ? 'IGST applicable (Different states)' : 'CGST + SGST applicable (Same state)'}</span>
      </div>
    </div>
  );
};

export default TaxBreakdown;
