import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FilterPanelProps } from '../types';

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onToggle }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="absolute right-0 top-10 mt-2 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg z-50 w-64"
    >
      <h4 className="text-base font-semibold mb-3">Filters</h4>
      <div className="space-y-2">
        {(['yes', 'no', 'abstain'] as const).map(key => (
          <label key={key} className="flex items-center">
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={() => onToggle(key)}
              className="mr-2"
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
