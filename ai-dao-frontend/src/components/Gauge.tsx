import React from "react";

interface GaugeProps {
  label: string;
  value: number;
  color?: string;
}

const Gauge: React.FC<GaugeProps> = ({ label, value, color }) => {
  const percent = Math.round(value * 100);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {percent}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: color || "#6366F1",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
};

export default Gauge;
