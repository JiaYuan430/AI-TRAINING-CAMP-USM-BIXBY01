
import React from 'react';
import { ClockIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-background-secondary shadow-md">
      <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center">
        <ClockIcon className="h-8 w-8 text-brand-primary" />
        <h1 className="ml-3 text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
          Delivery Time Predictor
        </h1>
      </div>
    </header>
  );
};

export default Header;
