import { useState, useMemo } from "react";
import { Switch } from "@headlessui/react";
import { motion } from "framer-motion";
import type { Proposal } from '../types';

type PortKey = "yes" | "no" | "abstain";

interface DecisionFlowProps {
  proposals: Proposal[];
  threshold: number;
}

export default function DecisionFlow({ proposals, threshold }: DecisionFlowProps) {
  const processed = proposals.length;

  const counts = useMemo(() => {
    const c: Record<PortKey, number> = { yes: 0, no: 0, abstain: 0 };
    proposals.forEach((p) => { c[p.aiDecision]++; });
    return c;
  }, [proposals]);

  const [enabledPorts, setEnabledPorts] = useState<Record<PortKey, boolean>>({ yes: true, no: true, abstain: true });

  const togglePort = (key: PortKey) => {
    setEnabledPorts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const paths = useMemo(() => {
    const keys: PortKey[] = ["yes", "no", "abstain"];
    return keys.map((key, i) => {
      const count = counts[key];
      if (!enabledPorts[key] || processed === 0) return null;
      const strokeWidth = (count / processed) * 40 + 2;
      const yStart = 30;
      const yEnd = 40 + i * 60;
      const path = `M50,${yStart} C250,${yStart} 250,${yEnd} 450,${yEnd}`;
      return (
        <motion.path
          key={key}
          d={path}
          stroke={key === "yes" ? "#10B981" : key === "no" ? "#EF4444" : "#FBBF24"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      );
    });
  }, [counts, enabledPorts, processed]);

  return (
    <div className="bg-gray-900 text-white rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">DECISION FLOW</h3>
      </div>

      <div className="flex">
        <div className="w-24 flex flex-col items-center">
          <div className="bg-gray-800 rounded p-2 mb-2 text-center">
            <span className="block text-xs">PROCESSED</span>
            <span className="block text-xl font-bold">{processed}</span>
          </div>
        </div>

        <div className="flex-1">
          <svg viewBox="0 0 500 200" className="w-full h-48">
            {paths}
          </svg>
        </div>

        <div className="pt-2 w-36 space-y-6">
          {(['yes', 'no', 'abstain'] as PortKey[]).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <div className="text-sm">
                <div>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                <div className="text-xs text-gray-400">{counts[key]} votes</div>
              </div>
              <Switch
                checked={enabledPorts[key]}
                onChange={() => togglePort(key)}
                className={`${enabledPorts[key] ? "bg-indigo-500" : "bg-gray-700"} relative inline-flex h-5 w-9 items-center rounded-full transition`}
              >
                <span className="sr-only">Toggle {key}</span>
                <span
                  className={`${enabledPorts[key] ? "translate-x-5" : "translate-x-1"} inline-block h-3 w-3 transform rounded-full bg-white transition`}
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
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${threshold}%` }} />
        </div>
      </div>
    </div>
  );
}
