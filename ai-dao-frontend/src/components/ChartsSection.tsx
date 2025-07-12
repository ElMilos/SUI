import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import type { ChartsSectionProps } from '../types';
import { useTheme } from '../contexts/ThemeContext';

export const ChartsSection: React.FC<ChartsSectionProps> = ({ proposalTrend, sentimentTrend }) => {
  const { darkMode } = useTheme();

  const containerClass = 'rounded-2xl shadow-md p-6 transition-colors duration-200';
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-white';
  const titleClass = `text-xs font-semibold uppercase mb-2 transition-colors duration-200 ${
    darkMode ? 'text-gray-400' : 'text-gray-500'
  }`;

  const axisTick = { fontSize: 12, fill: darkMode ? '#D1D5DB' : '#6B7280' };
  const strokeColor = darkMode ? '#818CF8' : '#6366F1';
  const areaFill = darkMode ? '#4F46E5' : '#C7D2FE';

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
    borderColor: darkMode ? '#4B5563' : '#E5E7EB',
    color: darkMode ? '#F9FAFB' : '#111827',
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6`}>      
      <div className={`${containerClass} ${bgClass}`}>
        <h3 className={titleClass}>Proposal Trend</h3>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={proposalTrend}>
              <XAxis dataKey="date" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke={strokeColor} fill={areaFill} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${containerClass} ${bgClass}`}>
        <h3 className={titleClass}>Sentiment Trend</h3>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sentimentTrend}>
              <XAxis dataKey="x" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipStyle} />
              <Line type="monotone" dataKey="y" stroke={strokeColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
