import { useState, useMemo } from "react";
import { Switch } from "@headlessui/react";
import { motion } from "framer-motion";
import type { Proposal } from '../types';
import { useTheme } from '../contexts/ThemeContext';

type PortKey = "yes" | "no" | "abstain";

interface DecisionFlowProps {
  proposals: Proposal[];
  threshold: number;
}

export default function DecisionFlow({ proposals, threshold }: DecisionFlowProps) {
  const { darkMode } = useTheme();
  const processed = proposals.length;

  const counts = useMemo(() => {
    const c: Record<PortKey, number> = { yes: 0, no: 0, abstain: 0 };
    proposals.forEach((p) => { c[p.aiDecision]++; });
    return c;
  }, [proposals]);

  const [enabledPorts, setEnabledPorts] = useState<Record<PortKey, boolean>>({ yes: true, no: true, abstain: true });
  const togglePort = (key: PortKey) => setEnabledPorts(prev => ({ ...prev, [key]: !prev[key] }));

  const paths = useMemo(() => {
    const keys: PortKey[] = ["yes", "no", "abstain"];
    return keys.map((key, i) => {
      const count = counts[key];
      if (!enabledPorts[key] || processed === 0) return null;
      const strokeWidth = (count / processed) * 40 + 2;
      const yStart = 30;
      const yEnd = 40 + i * 60;
      const path = `M50,${yStart} C250,${yStart} 250,${yEnd} 450,${yEnd}`;
      const color = key === "yes"
        ? darkMode ? "#059669" : "#10B981"
        : key === "no"
          ? darkMode ? "#B91C1C" : "#EF4444"
          : darkMode ? "#D97706" : "#FBBF24";
      return (
        <motion.path
          key={key}
          d={path}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      );
    });
  }, [counts, enabledPorts, processed, darkMode]);

  const containerClass = `rounded-xl p-6 shadow-xl transition-colors duration-200 ${
    darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
  }`;

  const boxClass = `rounded p-2 mb-2 text-center transition-colors duration-200 ${
    darkMode ? 'bg-gray-700' : 'bg-white'
  }`;

  const switchBg = (enabled: boolean) => enabled
    ? darkMode ? 'bg-indigo-600' : 'bg-indigo-500'
    : darkMode ? 'bg-gray-700' : 'bg-gray-300';

  const switchHandle = `inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200`;

  const labelText = (key: PortKey) => key.charAt(0).toUpperCase() + key.slice(1);

  const labelColor = darkMode ? 'text-gray-200' : 'text-gray-700';
  const subTextColor = darkMode ? 'text-gray-400 text-xs' : 'text-gray-500 text-xs';

  const thresholdBg = darkMode ? 'bg-gray-700' : 'bg-gray-300';
  const thresholdFill = darkMode ? 'bg-indigo-500' : 'bg-indigo-600';

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">DECISION FLOW</h3>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Processed count */}
        <div className="w-full md:w-24 flex flex-col items-center mb-4 md:mb-0">
          <div className={boxClass}>
            <span className="block text-xs">PROCESSED</span>
            <span className="block text-xl font-bold">{processed}</span>
          </div>
        </div>

        {/* Flow chart */}
        <div className="flex-1">
          <svg viewBox="0 0 500 200" className="w-full h-32 md:h-48">
            {paths}
          </svg>
        </div>

        {/* Legend & toggles */}
        <div className="w-full md:w-36 mt-4 md:mt-0 space-y-6">
          {(['yes', 'no', 'abstain'] as PortKey[]).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <div className="text-sm">
                <div className={labelColor}>{labelText(key)}</div>
                <div className={subTextColor}>{counts[key]} votes</div>
              </div>
              <Switch
                checked={enabledPorts[key]}
                onChange={() => togglePort(key)}
                className={`${switchBg(enabledPorts[key])} relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200`}
              >
                <span className="sr-only">Toggle {key}</span>
                <span
                  className={`${switchHandle} ${enabledPorts[key] ? 'translate-x-5' : 'translate-x-1'}`}
                />
              </Switch>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Sentiment Threshold</span>
          <span>{threshold}%</span>
        </div>
        <div className={`w-full ${thresholdBg} rounded-full h-2`}>          
          <div className={`h-2 rounded-full ${thresholdFill}`} style={{ width: `${threshold}%` }} />
        </div>
      </div>
    </div>
  );
}
