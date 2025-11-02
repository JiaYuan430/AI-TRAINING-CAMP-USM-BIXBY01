
import React from 'react';

interface PredictionResultProps {
  time: number;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ time }) => {
  return (
    <div className="bg-gradient-to-br from-brand-primary to-green-500 p-6 rounded-xl shadow-lg text-white text-center">
      <h3 className="text-lg font-medium uppercase tracking-wider text-green-100">
        Predicted Delivery Time
      </h3>
      <p className="mt-2 text-5xl font-bold">
        {time.toFixed(1)}
      </p>
      <p className="mt-1 text-2xl text-green-200">
        minutes
      </p>
    </div>
  );
};

export default PredictionResult;
