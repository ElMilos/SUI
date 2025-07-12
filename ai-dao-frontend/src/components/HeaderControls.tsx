import React from 'react';
import { Funnel } from 'lucide-react';
import type { HeaderControlsProps } from '../types';
import { DateFilter } from './DateFilter';

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  dateRangeLabel,
  onOpenDate,
  onToggleFilter,
  onOpenAddView,
}) => (
  <div className="relative flex items-center space-x-2">
    <button
      onClick={onToggleFilter}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <Funnel className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>

    {/* tutaj DateFilter jeśli używasz dalej */}
    <DateFilter
      label={dateRangeLabel}
      onOpen={onOpenDate}
      isOpen={false}
      tempRange={[]}
      onChangeRange={() => {}}
      onApply={() => {}}
    />

    <button
      onClick={onOpenAddView}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
    >
      Add View
    </button>
  </div>
);
