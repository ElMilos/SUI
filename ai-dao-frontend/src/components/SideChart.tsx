import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from '../contexts/ThemeContext';

interface SideChartProps {
  voteDistribution: Array<{ category: string; count: number }>;
}

const COLORS_LIGHT = ["#10B981", "#EF4444", "#FBBF24"];
const COLORS_DARK = ["#059669", "#B91C1C", "#D97706"];

const SideChart: React.FC<SideChartProps> = ({ voteDistribution }) => {
  const { darkMode } = useTheme();
  const containerClass = `rounded-xl shadow-md p-6 flex-1 h-full transition-colors duration-200 ${
    darkMode ? 'bg-gray-900' : 'bg-white'
  }`;
  const titleClass = `text-lg font-semibold mb-4 transition-colors duration-200 ${
    darkMode ? 'text-gray-100' : 'text-gray-900'
  }`;
  const legendTextColor = darkMode ? '#D1D5DB' : '#374151';
  const tooltipStyle = {
    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
    borderColor: darkMode ? '#4B5563' : '#E5E7EB',
    color: darkMode ? '#F9FAFB' : '#111827',
  };

  return (
    <div className={containerClass}>
      <h3 className={titleClass}>Vote Distribution</h3>
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
                  fill={
                    darkMode
                      ? COLORS_DARK[index % COLORS_DARK.length]
                      : COLORS_LIGHT[index % COLORS_LIGHT.length]
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: tooltipStyle.color }}
              formatter={(value: number) => `${value} votes`}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                color: legendTextColor,
                transition: 'color 0.2s',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SideChart;
