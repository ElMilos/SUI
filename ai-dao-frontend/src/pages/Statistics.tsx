import React, { useState } from "react";
import { CalendarRange } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Dummy data generator
const generateData = (start: number, end: number, points: number) => {
  const step = (end - start) / (points - 1);
  return Array.from({ length: points }, (_, i) => ({
    date: new Date(start + step * i).toLocaleDateString(),
    value: Math.round(Math.random() * 1000) / 10,
  }));
};

const Statistics: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [range, setRange] = useState<{ from: Date; to: Date }>(() => ({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  }));
  const [views, setViews] = useState<Array<{ id: number; title: string }>>([]);
  const [nextId, setNextId] = useState(1);

  const handleAddView = () => {
    setViews((prev) => [...prev, { id: nextId, title: `View ${nextId}` }]);
    setNextId((id) => id + 1);
  };

  const data = generateData(range.from.getTime(), range.to.getTime(), 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Analytics
        </h2>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700">
            <CalendarRange className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
            <span>
              {range.from.toLocaleDateString()} -{" "}
              {range.to.toLocaleDateString()}
            </span>
          </button>
          <button
            onClick={handleAddView}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add View
          </button>
        </div>
      </div>

      {/* Views List */}
      {views.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No views added yet.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {views.map((view) => (
          <div
            key={view.id}
            className="bg-white dark:bg-gray-900 rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              {view.title}
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366F1"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
