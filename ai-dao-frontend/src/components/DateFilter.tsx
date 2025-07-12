import React from 'react';
import { Calendar } from 'lucide-react';
import { DateRange, type Range } from 'react-date-range';
import { motion, AnimatePresence } from 'framer-motion';

interface DateFilterProps {
  label: string;
  onOpen: () => void;
  isOpen?: boolean;
  tempRange?: Range[];
  onChangeRange?: (ranges: Range[]) => void;
  onApply?: () => void;
  onReset?: () => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  label,
  onOpen,
  isOpen,
  tempRange,
  onChangeRange,
  onApply,
  onReset,
}) => (
  <div className="relative">
    <button
      onClick={onOpen}
      className="flex items-center px-4 py-2 border dark:border-gray-900 rounded-lg hover:bg-gray-100 dark:bg-gray-900 transition"
    >
      <Calendar className="w-4 h-4 mr-2" />
      {label}
    </button>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="date-picker"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="absolute right-0 mt-2 bg-white dark:bg-gray-900 p-3 rounded-lg shadow-lg z-20"
        >
          <DateRange
            ranges={tempRange!}
            onChange={(ranges) => onChangeRange!([ranges.selection as Range])}
            maxDate={new Date()}
          />
          <div className="mt-2 flex space-x-2">
            <button
              onClick={onApply}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded"
            >
              Apply
            </button>
            <button
              onClick={onReset}
              className="flex-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-1 rounded"
            >
              All Time
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
