import React from 'react';
import { Driver } from '../types';
import { UserCircleIcon } from './Icons';

interface DriverSuggestionProps {
  drivers: Driver[];
  suggestedDriver: Driver;
}

const statusColorMap = {
  available: 'bg-green-500',
  'on-delivery': 'bg-yellow-500',
  offline: 'bg-slate-500'
};

const DriverCard: React.FC<{ driver: Driver; isSuggested: boolean }> = ({ driver, isSuggested }) => (
  <div className={`flex items-center justify-between p-4 rounded-lg transition-all ${isSuggested ? 'bg-brand-secondary ring-2 ring-brand-primary' : 'bg-slate-800'}`}>
    <div className="flex items-center">
        <UserCircleIcon className={`h-10 w-10 ${isSuggested ? 'text-white' : 'text-text-secondary'}`}/>
        <div className="ml-4">
            <p className={`font-semibold ${isSuggested ? 'text-white' : 'text-text-primary'}`}>{driver.name}</p>
            <p className={`text-sm capitalize ${isSuggested ? 'text-slate-300' : 'text-text-secondary'}`}>Workload: {driver.workload} orders</p>
        </div>
    </div>
    <div className="flex items-center">
        {isSuggested && <span className="text-xs font-bold text-brand-primary bg-background-primary px-2 py-1 rounded-full mr-3">RECOMMENDED</span>}
        <div className="flex items-center">
            <span className={`h-3 w-3 rounded-full ${statusColorMap[driver.status]}`}></span>
            <span className={`ml-2 text-sm capitalize ${isSuggested ? 'text-slate-300' : 'text-text-secondary'}`}>{driver.status.replace('-', ' ')}</span>
        </div>
    </div>
  </div>
);

const DriverSuggestion: React.FC<DriverSuggestionProps> = ({ drivers, suggestedDriver }) => {
  return (
    <div className="bg-background-secondary p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-brand-primary">Driver Suggestions</h2>
      <div className="space-y-3">
        {drivers
          .filter(d => d.id === suggestedDriver.id)
          .map(d => <DriverCard key={d.id} driver={d} isSuggested={true} />)
        }
        {drivers
          .filter(d => d.id !== suggestedDriver.id)
          .sort((a,b) => a.id - b.id)
          .map(d => <DriverCard key={d.id} driver={d} isSuggested={false} />)
        }
      </div>
    </div>
  );
};

export default DriverSuggestion;
