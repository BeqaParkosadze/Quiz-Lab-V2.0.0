import React from 'react';
import { motion } from 'motion/react';
import { Mail } from 'lucide-react';

export const ContactPage: React.FC<{isDarkMode: boolean}> = ({ isDarkMode }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`min-h-screen p-10 flex items-center justify-center ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`max-w-md w-full p-8 rounded-3xl border shadow-xl text-center space-y-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <Mail size={48} className="mx-auto text-emerald-500" />
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>For inquiries, reach out to us.</p>
        <a href="mailto:support@quizlab.com" className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors">
          support@quizlab.com
        </a>
      </div>
    </motion.div>
  );
};
