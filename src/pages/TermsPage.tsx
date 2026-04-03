import React from 'react';
import { motion } from 'motion/react';

export const TermsPage: React.FC<{isDarkMode: boolean}> = ({ isDarkMode }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`min-h-screen p-10 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p>Welcome to Quiz Lab. By using our website, you agree to these terms.</p>
        <h2 className="text-2xl font-semibold">Usage</h2>
        <p>You may use our service for personal, non-commercial purposes. You agree not to misuse our content or infrastructure.</p>
        <h2 className="text-2xl font-semibold">Intellectual Property</h2>
        <p>All content on Quiz Lab is the property of Quiz Lab or its content suppliers and is protected by international copyright laws.</p>
      </div>
    </motion.div>
  );
};
