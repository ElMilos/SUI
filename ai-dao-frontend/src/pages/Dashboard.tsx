// src/pages/Dashboard.tsx
import React, { useEffect, useState, useMemo } from "react";
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
import { DateRange, type Range } from "react-date-range";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import DecisionFlow from "../components/DecisionFlow";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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
  const [dateRangeLabel, setDateRangeLabel] = useState("All time");

  // 1) stan tymczasowy do kalendarza
  const [tempRange, setTempRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  // 2) zakres faktycznie użyty do filtrowania (ustawiany po Apply)
  const [appliedRange, setAppliedRange] = useState<Range[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // filter toggles
  const [filters, setFilters] = useState({
    yes: false,
    no: false,
    abstain: false,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // views list
  const [views, setViews] = useState<string[]>([]);
  const [isAddViewOpen, setIsAddViewOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");

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

  // filtered proposals by aiDecision and date
  const filteredProposals = useMemo(() => {
    return proposals
      .filter((p) => {
        const pDate = p.date instanceof Date ? p.date : new Date(p.date);
        // filtrujemy tylko po zatwierdzeniu (gdy mamy appliedRange i nie "All time")
        if (dateRangeLabel !== "All time" && appliedRange.length) {
          const start = startOfDay(appliedRange[0].startDate!);
          const end = endOfDay(appliedRange[0].endDate!);
          if (!isWithinInterval(pDate, { start, end })) return false;
        }
        return true;
      })
      .filter((p) => {
        // aiDecision filters
        if (!filters.yes && !filters.no && !filters.abstain) return true;
        return filters[p.aiDecision as keyof typeof filters];
      });
  }, [proposals, dateRangeLabel, appliedRange, filters]);

  // metrics based on filtered
  const total = filteredProposals.length;
  const yesCount = filteredProposals.filter(
    (p) => p.aiDecision === "yes"
  ).length;
  const noCount = filteredProposals.filter((p) => p.aiDecision === "no").length;
  const abstainCount =
    filteredProposals.filter((p) => p.aiDecision === "abstain").length || 0;
  const avgSentiment = total
    ? (filteredProposals.reduce((sum, p) => sum + p.sentimentScore, 0) /
        total) *
      100
    : 0;
  const participation = total > 0 ? (yesCount + noCount) / total : 0;

  const sentimentTrend = filteredProposals.map((p, i) => ({
    x: `#${i + 1}`,
    y: Math.round(p.sentimentScore * 100),
  }));

  const voteDistribution = [
    { category: "Yes", count: yesCount },
    { category: "No", count: noCount },
    { category: "Abstain", count: abstainCount },
  ];

  // handlers
  const toggleFilterPanel = () => setIsFilterOpen((f) => !f);
  const toggleFilter = (key: keyof typeof filters) =>
    setFilters((f) => ({ ...f, [key]: !f[key] }));

  const openDatePicker = () => setIsDatePickerOpen(true);
  const applyDateRange = () => {
    const { startDate, endDate } = tempRange[0];
    // jeśli ten sam dzień, pokaż tylko jedną datę
    if (startDate!.getTime() === endDate!.getTime()) {
      setDateRangeLabel(format(startDate!, "MMM d, yyyy"));
    } else {
      setDateRangeLabel(
        `${format(startDate!, "MMM d, yyyy")} - ${format(
          endDate!,
          "MMM d, yyyy"
        )}`
      );
    }
    setAppliedRange(tempRange);
    setIsDatePickerOpen(false);
  };

  const openAddView = () => setIsAddViewOpen(true);
  const closeAddView = () => {
    setIsAddViewOpen(false);
    setNewViewName("");
  };
  const saveView = () => {
    if (newViewName.trim()) {
      setViews((vs) => [...vs, newViewName.trim()]);
      closeAddView();
    }
  };

  return (
    <div className="space-y-6">
      {/* Decision Flow */}
      <DecisionFlow />

      {/* Views list */}
      {views.length > 0 && (
        <div className="flex space-x-2">
          {views.map((v) => (
            <span
              key={v}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
            >
              {v}
            </span>
          ))}
        </div>
      )}

      {/* Header controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          {/* Filter button */}
          <button
            onClick={toggleFilterPanel}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Funnel className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Date picker */}
          <div className="relative">
            <button
              onClick={openDatePicker}
              className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {dateRangeLabel}
            </button>
            {isDatePickerOpen && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 p-2 rounded shadow-lg z-10">
                <DateRange
                  ranges={tempRange}
                  onChange={(ranges) =>
                    setTempRange([ranges.selection as Range])
                  }
                  maxDate={new Date()}
                />
                <button
                  onClick={applyDateRange}
                  className="mt-2 w-full px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Add View */}
          <button
            onClick={openAddView}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add View
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {isFilterOpen && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Filters</h4>
          {(["yes", "no", "abstain"] as const).map((key) => (
            <label key={key} className="block mb-1">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={() => toggleFilter(key)}
                className="mr-2"
              />
              Only AI {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>
      )}

      {/* Top metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Proposals" value={`${total}`} />
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

      {/* Lower charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vote Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
            Vote Distribution
          </h3>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={voteDistribution}>
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
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
                <XAxis dataKey="x" tick={{ fontSize: 12, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                <Tooltip />
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
        </div>
      </div>

      {/* Add View Modal */}
      {isAddViewOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Add New View</h3>
            <input
              type="text"
              placeholder="View name"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              className="border p-2 w-full mb-4 rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeAddView}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={saveView}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
