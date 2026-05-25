import React from 'react';

interface CardSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const CardSection: React.FC<CardSectionProps> = ({ title, subtitle, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default CardSection;
