import React from 'react';
import { motion } from 'motion/react';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle }) => {
  return (
    <motion.div
      className={`w-12 h-6 rounded-full p-1 cursor-pointer flex items-center ${isOn ? 'bg-emerald-500' : 'bg-gray-300'}`}
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ x: isOn ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.div>
  );
};
