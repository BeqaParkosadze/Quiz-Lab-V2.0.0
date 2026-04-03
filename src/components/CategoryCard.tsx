import * as React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { CategoryCardProps } from '../types';

export const CategoryCard: React.FC<CategoryCardProps & { isDarkMode: boolean }> = ({ cat, idx, onClick, isDarkMode }) => {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { delay: idx * 0.05, ease: "easeOut" } },
    hover: { 
      y: -8, 
      boxShadow: isDarkMode 
        ? "0 20px 30px -10px rgba(0,0,0,0.6)" 
        : "0 20px 30px -10px rgba(0,0,0,0.1)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hover: { 
      scale: 1.1, 
      rotate: 5,
      transition: { type: 'spring', stiffness: 300, damping: 15 }
    }
  };

  return (
    <motion.button
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label={`Select category: ${cat.title}. ${cat.description}`}
      className={`group relative w-full p-6 rounded-3xl cursor-pointer transition-all duration-300 flex flex-col items-start text-left gap-5 border ${
        isDarkMode 
          ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' 
          : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Icon Wrapper */}
      <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : cat.color} shadow-inner`}>
        <motion.div variants={iconVariants}>
          {React.cloneElement(cat.icon as React.ReactElement, { 
            size: 32, 
            className: isDarkMode ? 'text-emerald-400' : (cat.iconColor || 'text-gray-900') 
          })}
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col w-full">
        <h3 className={`text-xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{cat.title}</h3>
        <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {cat.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {cat.subcategories.slice(0, 3).map(sub => (
            <span key={sub} className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {sub}
            </span>
          ))}
          {cat.subcategories.length > 3 && (
            <span className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              +{cat.subcategories.length - 3}
            </span>
          )}
        </div>
      </div>
      
      {/* Action Arrow */}
      <div className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-gray-400 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-900 group-hover:text-white'}`}>
        <ChevronRight size={20} />
      </div>
    </motion.button>
  );
}
