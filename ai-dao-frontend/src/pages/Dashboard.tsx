/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Funnel, Calendar } from "lucide-react";
import { fetchProposals } from "../services/api";
import type { Proposal } from "../types/Proposal";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  chartData?: Array<{ x: string; y: number }>;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  chartData,
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
          {title}
        </h3>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {value}{" "}
          {change && (
            <span
              className={`text-sm font-medium ${
                change.startsWith("-") ? "text-red-500" : "text-green-500"
              }`}
            >
              {change}
            </span>
          )}
        </p>
      </div>
    </div>
    {chartData && (
      <div className="mt-4 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="y"
              stroke="#6366F1"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

const Dashboard: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [dateRange, setDateRange] = useState<string>(
    "Jan 20, 2022 - Feb 09, 2022"
  );

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProposals();
        setProposals(data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  // Compute metrics
  const total = proposals.length;
  const yesCount = proposals.filter((p) => p.aiDecision === "yes").length;
  const noCount = proposals.filter((p) => p.aiDecision === "no").length;
  const abstainCount = proposals.filter((p) => p.aiDecision === "abstain").length || 0;
  const avgSentiment = total
    ?
      (proposals.reduce((sum, p) => sum + p.sentimentScore, 0) / total) * 100
    : 0;
  const participation = total > 0 ? (yesCount + noCount) / total : 0;

  // Chart data for trend of sentiment per proposal
  const sentimentTrend = proposals.map((p, i) => ({
    x: `#${i + 1}`,
    y: Math.round(p.sentimentScore * 100),
  }));

  // Chart data for vote distribution
  const voteDistribution = [
    { category: 'Yes', count: yesCount },
    { category: 'No', count: noCount },
    { category: 'Abstain', count: abstainCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Funnel className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700">
            <Calendar className="w-4 h-4 mr-2" />
            {dateRange}
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Add View
          </button>
        </div>
      </div>

      {/* Top metric cards with real data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Proposals"
          value={`${total}`}
          change={undefined}
        />
        <MetricCard
          title="Avg. Sentiment"
          value={`${avgSentiment.toFixed(1)}%`}
          chartData={sentimentTrend}
        />
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

      {/* Lower charts row based on proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vote Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
            Vote Distribution
          </h3>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={voteDistribution}>
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip />
                <Bar dataKey="count" barSize={20} fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
            Sentiment Trend
          </h3>
          <div className="mt-4 h-44">
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
    </div>
  );
};

export default Dashboard;
