import React from 'react';
import { MetricCard } from './MetricCard';
import type { MetricsSectionProps } from '../types';

export const MetricsSection: React.FC<MetricsSectionProps> = ({ total, avgSentiment, participation, sentimentTrend }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <MetricCard title="Total Proposals" value={`${total}`} />
    <MetricCard title="Avg. Sentiment" value={`${avgSentiment.toFixed(1)}%`} chartData={sentimentTrend} />
    <MetricCard
      title="Participation"
      value={`${Math.round(participation * 100)}%`}
      change={
        participation >= 0.6
          ? `+${Math.round(participation * 100)}%`
          : `-${Math.round((1 - participation) * 100)}%`
      }
    />
  </div>
);