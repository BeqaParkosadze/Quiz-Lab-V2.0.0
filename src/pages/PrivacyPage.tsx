import React from 'react';
import { motion } from 'motion/react';

export const PrivacyPage: React.FC<{isDarkMode: boolean}> = ({ isDarkMode }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`min-h-screen p-10 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p>At Quiz Lab, we take your privacy seriously. This policy outlines how we handle your data.</p>
        <h2 className="text-2xl font-semibold">Cookies and Third-Party Ads</h2>
        <p>We use cookies to enhance your experience. We also use third-party advertising services, such as Google AdSense, which may use cookies to serve ads based on your visit to our site and other sites on the internet.</p>
        <h2 className="text-2xl font-semibold">Data Protection</h2>
        <p>We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure.</p>
      </div>
    </motion.div>
  );
};
