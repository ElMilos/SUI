import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FilterPanelProps } from '../types';
import { useTheme } from '../contexts/ThemeContext';

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onToggle }) => {
  const { darkMode } = useTheme();

  const panelClass = `absolute right-0 top-10 mt-2 p-4 rounded-lg shadow-lg z-50 w-64 transition-colors duration-200 ${
    darkMode ? 'bg-gray-900 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'
  }`;

  const headingClass = `text-base font-semibold mb-3 transition-colors duration-200 ${
    darkMode ? 'text-gray-100' : 'text-gray-900'
  }`;

  const labelClass = `flex items-center transition-colors duration-200 ${
    darkMode ? 'text-gray-200' : 'text-gray-700'
  }`;

  const checkboxClass = `mr-2 transition-colors duration-200 focus:ring-2 focus:ring-offset-1 ${
    darkMode ? 'text-indigo-400' : 'text-indigo-600'
  }`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className={panelClass}
      >
        <h4 className={headingClass}>Filters</h4>
        <div className="space-y-2">
          {(['yes', 'no', 'abstain'] as const).map((key) => (
            <label key={key} className={labelClass}>
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={() => onToggle(key)}
                className={checkboxClass}
              />
              <span className="text-sm">
                Only AI {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
