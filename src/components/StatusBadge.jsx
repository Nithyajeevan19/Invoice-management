import { CheckCircle, Send, Clock, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status, onStatusChange }) => {
  const statusConfig = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock, label: 'Draft' },
    sent: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Send, label: 'Sent' },
    paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Paid' },
    overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle, label: 'Overdue' },
  };

  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} hover:shadow-md transition`}
      >
        <Icon className="h-4 w-4" />
        {config.label}
      </button>

      {/* Dropdown Menu */}
      <div className="absolute hidden group-hover:block right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
        {Object.entries(statusConfig).map(([key, val]) => (
          <button
            key={key}
            onClick={() => onStatusChange(key)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
              status === key ? 'bg-blue-50 text-blue-600 font-semibold' : ''
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusBadge;
