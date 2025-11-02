import React from 'react';
import { Driver, DeliveryHistoryItem, PerformanceMetrics, PredictionFeatures } from '../types';
import { XIcon, ChartBarIcon, CalendarIcon, TruckIcon, UserCircleIcon } from './Icons';

interface DriverDetailsModalProps {
  driver: Driver;
  history: DeliveryHistoryItem[];
  metrics: PerformanceMetrics;
  pendingOrder: { features: PredictionFeatures, predictedTime: number } | null;
  onClose: () => void;
}

const statusStyles: { [key in Driver['status']]: { bg: string, text: string } } = {
  available: { bg: 'bg-green-500/20', text: 'text-green-400' },
  'on-delivery': { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  offline: { bg: 'bg-slate-500/20', text: 'text-slate-400' }
};

const MetricCard: React.FC<{label: string; value: string | number; unit?: string}> = ({ label, value, unit }) => (
    <div className="bg-slate-800 p-4 rounded-lg text-center">
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">
            {value}
            {unit && <span className="text-base font-medium text-text-secondary ml-1">{unit}</span>}
        </p>
    </div>
);

const DriverDetailsModal: React.FC<DriverDetailsModalProps> = ({ driver, history, metrics, pendingOrder, onClose }) => {

  const isAssignedCurrentOrder = pendingOrder && driver.status === 'on-delivery';

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-background-secondary rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <UserCircleIcon className="h-8 w-8 text-brand-primary" />
            <div>
                <h2 className="text-xl font-bold text-text-primary">{driver.name}</h2>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles[driver.status].bg} ${statusStyles[driver.status].text}`}>
                        {driver.status.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-text-secondary">Workload: {driver.workload} orders</span>
                </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Performance Metrics */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-3">
                <ChartBarIcon className="h-5 w-5 text-brand-primary" />
                Performance Metrics
            </h3>
            <div className="grid grid-cols-3 gap-4">
                <MetricCard label="Completion Rate" value={metrics.completionRate} unit="%" />
                <MetricCard label="Avg. Time" value={metrics.avgDeliveryTime.toFixed(1)} unit="min" />
                <MetricCard label="Total Deliveries" value={metrics.totalDeliveries} />
            </div>
          </div>
          
          {/* Current Assignment */}
          {isAssignedCurrentOrder && (
             <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-3">
                    <TruckIcon className="h-5 w-5 text-brand-primary" />
                    Current Assignment
                </h3>
                <div className="bg-slate-800 p-4 rounded-lg">
                    <p className="font-semibold text-text-primary">{pendingOrder.features['地址']}</p>
                    <p className="text-sm text-text-secondary">Predicted Time: {pendingOrder.predictedTime.toFixed(1)} mins</p>
                </div>
             </div>
          )}

          {/* Delivery History */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-3">
                <CalendarIcon className="h-5 w-5 text-brand-primary" />
                Delivery History
            </h3>
            <div className="space-y-2">
                {history.length > 0 ? (
                    history.map(item => (
                        <div key={item.id} className="bg-slate-800 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-medium text-text-primary">{item.address}</p>
                                <p className="text-xs text-text-secondary">{item.date}</p>
                            </div>
                            <p className="text-sm text-text-secondary">{item.timeTaken} min</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 bg-slate-800 rounded-lg">
                        <p className="text-text-secondary">No delivery history available.</p>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailsModal;
