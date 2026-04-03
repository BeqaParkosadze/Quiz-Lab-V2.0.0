import * as React from 'react';

export const DynamicBackground: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none -z-10 transition-colors duration-500 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`} />
  );
};
