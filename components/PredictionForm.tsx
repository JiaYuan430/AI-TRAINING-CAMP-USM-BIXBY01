import React, { useState, useEffect } from 'react';
import { PredictionFeatures } from '../types';
import { LoaderIcon, RocketIcon } from './Icons';

interface PredictionFormProps {
  initialData: PredictionFeatures | null;
  onSubmit: (features: PredictionFeatures, coords?: {lat: number, lng: number}) => void;
  isLoading: boolean;
}

const defaultFormData: PredictionFeatures & { lat?: number; lng?: number } = {
  '地址': '', '数量': 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0,
  A1: 0, A2: 0, A3: 0, A4: 0, Distance_km: 0, Traffic_factor: 1.0, Weight_kg: 0,
  lat: undefined, lng: undefined
};

const FormInput: React.FC<{ label: string; name: keyof (PredictionFeatures & { lat?: number; lng?: number }); value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; step?: string; min?: string; disabled?: boolean; }> = ({ label, name, value, onChange, type = "number", step, min, disabled = false }) => (
    <div>
        <label htmlFor={name} className={`block text-sm font-medium ${disabled ? 'text-slate-500' : 'text-text-secondary'}`}>{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            step={step}
            min={min}
            disabled={disabled}
            className="mt-1 block w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-slate-900 disabled:text-slate-500"
        />
    </div>
);


const PredictionForm: React.FC<PredictionFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PredictionFeatures & { lat?: number; lng?: number }>(defaultFormData);
  const [isManualEntry, setIsManualEntry] = useState(true);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsManualEntry(false);
    } else {
      setFormData(defaultFormData);
      setIsManualEntry(true);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { lat, lng, ...features } = formData;
    const coords = (lat !== undefined && lng !== undefined && isManualEntry) ? { lat, lng } : undefined;
    onSubmit(features, coords);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput label="Address" name="地址" value={formData['地址']} onChange={handleChange} type="text" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput label="Quantity" name="数量" value={formData['数量']} onChange={handleChange} min="0" />
        <FormInput label="Distance (km)" name="Distance_km" value={formData.Distance_km} onChange={handleChange} step="0.01" min="0" />
        <FormInput label="Weight (kg)" name="Weight_kg" value={formData.Weight_kg} onChange={handleChange} step="0.1" min="0" />
      </div>
       <FormInput label="Traffic Factor" name="Traffic_factor" value={formData.Traffic_factor} onChange={handleChange} step="0.01" min="0" />
      
       {isManualEntry && (
        <div className="grid grid-cols-2 gap-4">
            <FormInput label="Latitude" name="lat" value={formData.lat || ''} onChange={handleChange} step="any" disabled={!isManualEntry} />
            <FormInput label="Longitude" name="lng" value={formData.lng || ''} onChange={handleChange} step="any" disabled={!isManualEntry} />
        </div>
       )}

      <div>
        <p className="text-sm font-medium text-text-secondary">Building Blocks (A-G)</p>
        <div className="grid grid-cols-4 gap-2 mt-1">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(block => (
                <FormInput key={block} label={block} name={block as keyof PredictionFeatures} value={formData[block as 'A']} onChange={handleChange} min="0" />
            ))}
        </div>
      </div>
       <div>
        <p className="text-sm font-medium text-text-secondary">Building Blocks (A1-A4)</p>
        <div className="grid grid-cols-4 gap-2 mt-1">
            {['A1', 'A2', 'A3', 'A4'].map(block => (
                <FormInput key={block} label={block} name={block as keyof PredictionFeatures} value={formData[block as 'A1']} onChange={handleChange} min="0" />
            ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-secondary focus:ring-brand-primary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
            <>
                <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                <span>Predicting...</span>
            </>
        ) : (
            <>
                <RocketIcon className="-ml-1 mr-3 h-5 w-5" />
                <span>Predict Delivery Time</span>
            </>
        )}
      </button>
    </form>
  );
};

export default PredictionForm;