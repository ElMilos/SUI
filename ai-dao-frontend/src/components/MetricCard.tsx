import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  chartData?: Array<{ x: string; y: number }>;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, chartData }) => {
  const { darkMode } = useTheme();

  const cardClass = `rounded-2xl shadow-md p-6 transition-colors duration-200 ${
    darkMode ? 'bg-gray-900' : 'bg-white'
  }`;
  const titleClass = `text-xs font-semibold uppercase transition-colors duration-200 ${
    darkMode ? 'text-gray-400' : 'text-gray-500'
  }`;
  const valueClass = `mt-1 text-3xl font-bold transition-colors duration-200 ${
    darkMode ? 'text-gray-100' : 'text-gray-900'
  }`;
  const changeClass = change && (change.startsWith('-')
    ? 'text-red-500'
    : 'text-green-500');

  const lineStroke = darkMode ? '#818CF8' : '#6366F1';

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={titleClass}>{title}</h3>
          <p className={valueClass}>
            {value}{' '}
            {change && (
              <span className={`${changeClass} text-sm font-medium`}>
                {change}
              </span>
            )}
          </p>
        </div>
      </div>
      {chartData && (
        <div className="mt-4 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="y" stroke={lineStroke} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
