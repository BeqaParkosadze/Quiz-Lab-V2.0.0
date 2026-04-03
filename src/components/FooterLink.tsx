import React from 'react';

export function FooterLink({ href, children, isDarkMode, onClick }: { href?: string, children: React.ReactNode, isDarkMode?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`text-sm transition-colors ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-900'}`}
    >
      {children}
    </button>
  );
}
