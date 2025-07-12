import React from 'react';
import { Calendar } from 'lucide-react';
import { DateRange, type Range } from 'react-date-range';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

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
}) => {
  const { darkMode } = useTheme();

  const buttonBase = 'flex items-center px-4 py-2 border rounded-lg transition-colors duration-200';
  const pickerBase = 'absolute right-0 mt-2 p-3 rounded-lg shadow-lg z-20';

  const buttonClass = darkMode
    ? `${buttonBase} bg-gray-900 border-gray-700 hover:bg-gray-800 text-gray-100`
    : `${buttonBase} bg-gray-100 hover:bg-gray-200 text-gray-900`;

  const pickerClass = darkMode
    ? `${pickerBase} bg-gray-900 border border-gray-700`
    : `${pickerBase} bg-white border border-gray-200`;

  const applyClass = darkMode
    ? 'flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-1 rounded'
    : 'flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded';

  const resetClass = darkMode
    ? 'flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-1 rounded'
    : 'flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 rounded';

  return (
    <div className="relative">
      <button onClick={onOpen} className={buttonClass}>
        <Calendar className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} />
        <span className={darkMode ? 'text-gray-100' : 'text-gray-900'}>{label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="date-picker"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className={pickerClass}
          >
            <DateRange
              ranges={tempRange!}
              onChange={(ranges) => onChangeRange!([ranges.selection as Range])}
              maxDate={new Date()}
              direction="vertical"
              className='bg-white text-gray-900'
            />
            <div className="mt-2 flex space-x-2">
              <button onClick={onApply} className={applyClass}>
                Apply
              </button>
              <button onClick={onReset} className={resetClass}>
                All Time
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};