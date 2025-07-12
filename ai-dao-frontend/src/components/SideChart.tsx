import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface SideChartProps {
  voteDistribution: Array<{ category: string; count: number }>;
}

const COLORS = ["#10B981", "#EF4444", "#FBBF24"];

const SideChart: React.FC<SideChartProps> = ({ voteDistribution }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex-1 h-full">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
      Vote Distribution
    </h3>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={voteDistribution}
            dataKey="count"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={60}
            innerRadius={30}
            paddingAngle={2}
          >
            {voteDistribution.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value} votes`} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default SideChart;
