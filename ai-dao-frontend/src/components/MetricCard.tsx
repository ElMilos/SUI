import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  chartData?: Array<{ x: string; y: number }>;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, chartData }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
          {title}
        </h3>
        <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
          {value}{' '}
          {change && (
            <span className={`${change.startsWith('-') ? 'text-red-500' : 'text-green-500'} text-sm font-medium`}>
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
            <Line type="monotone" dataKey="y" stroke="#6366F1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);