import React from 'react';
import { X, AlertTriangle, Bell, Pill } from 'lucide-react';

export interface AlertItem {
  id: string;
  type: 'missedDose' | 'noChat' | 'refill';
  message: string;
  timestamp: string;
}

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
}

const getAlertDetails = (type: AlertItem['type']) => {
  switch (type) {
    case 'missedDose':
      return { icon: <Pill className="h-5 w-5 text-red-600" />, className: 'bg-red-50 border-red-200' };
    case 'noChat':
      return { icon: <Bell className="h-5 w-5 text-yellow-600" />, className: 'bg-yellow-50 border-yellow-200' };
    case 'refill':
      return { icon: <Pill className="h-5 w-5 text-blue-600" />, className: 'bg-blue-50 border-blue-200' };
    default:
      return { icon: <AlertTriangle className="h-5 w-5 text-gray-600" />, className: 'bg-gray-50 border-gray-200' };
  }
};

const AlertsModal: React.FC<AlertsModalProps> = ({ isOpen, onClose, alerts }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2147483648] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">All Alerts</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.map(alert => {
            const { icon, className } = getAlertDetails(alert.type);
            return (
              <div key={alert.id} className={`p-4 border rounded-lg flex items-start gap-3 ${className}`}>
                <div className="mt-1">{icon}</div>
                <div>
                  <p className="text-sm text-gray-800">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-gray-200 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-[#F35E4A] text-white rounded-lg hover:bg-[#e54d37]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertsModal;
