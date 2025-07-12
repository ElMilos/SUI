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

export const ChartsSection: React.FC<ChartsSectionProps> = ({ proposalTrend, sentimentTrend }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Trend liczby propozycji jako wykres powierzchniowy */}
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase">Proposal Trend</h3>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={proposalTrend}>
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#6366F1" fill="#C7D2FE" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Trend sentymentu jako wykres liniowy */}
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase">Sentiment Trend</h3>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sentimentTrend}>
            <XAxis dataKey="x" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#6366F1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);
