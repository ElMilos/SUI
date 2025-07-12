// src/components/DecisionFlow.tsx
import React, { useState, useMemo } from "react";
import { Switch } from "@headlessui/react";
import { Plus } from "lucide-react";

type PortKey = "yes" | "no" | "abstain";

interface Port {
  label: string;
  count: number;
  enabled: boolean;
}

export default function DecisionFlow() {
  // Symulowane dane z backendu/serwisu
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [processed, setProcessed] = useState(56); // ile propozycji przetworzono
  const [ports, setPorts] = useState<Record<PortKey, Port>>({
    yes: { label: "Yes", count: 34, enabled: true },
    no: { label: "No", count: 15, enabled: true },
    abstain: { label: "Abstain", count: 7, enabled: false },
  });

  // próg sentymentu
  const [threshold, setThreshold] = useState(70);
  const thresholdLabel = useMemo(() => `${threshold}%`, [threshold]);

  // toggle auto-voting
  const togglePort = (key: PortKey) => {
    setPorts((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  // przygotuj ścieżki SVG: grubość proporcjonalna do count/processed
  const paths = useMemo(() => {
    const keys: PortKey[] = ["yes", "no", "abstain"];
    return keys.map((key, i) => {
      const p = ports[key];
      if (!p.enabled || processed === 0) return null;
      const w = (p.count / processed) * 20 + 2;
      const y1 = 60;
      const y2 = 40 + i * 40;
      const color =
        key === "yes" ? "#10B981" : key === "no" ? "#EF4444" : "#FBBF24";
      return (
        <path
          key={key}
          d={`M100,${y1} C200,${y1} 200,${y2} 300,${y2}`}
          stroke={color}
          strokeWidth={w}
          fill="none"
          strokeLinecap="round"
        />
      );
    });
  }, [ports, processed]);

  return (
    <div className="bg-gray-900 text-white rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">DECISION FLOW</h3>
        <button className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded">
          <Plus className="w-4 h-4" />
          <span className="text-sm">NEW PROPOSAL</span>
        </button>
      </div>

      <div className="flex">
        {/* Processed Proposals */}
        <div className="w-24 flex flex-col items-center">
          <div className="bg-gray-800 rounded p-2 mb-2 text-center">
            <span className="block text-xs">PROCESSED</span>
            <span className="block text-xl font-bold">{processed}</span>
          </div>
        </div>

        {/* SVG Flow */}
        <div className="flex-1">
          <svg width="100%" height="200">
            {paths}
          </svg>
        </div>

        {/* Ports */}
        <div className="w-36 space-y-3">
          {Object.entries(ports).map(([key, p]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="text-sm">
                <div>{p.label}</div>
                <div className="text-xs text-gray-400">{p.count} votes</div>
              </div>
              <Switch
                checked={p.enabled}
                onChange={() => togglePort(key as PortKey)}
                className={`${
                  p.enabled ? "bg-indigo-500" : "bg-gray-700"
                } relative inline-flex h-5 w-9 items-center rounded-full transition`}
              >
                <span className="sr-only">Toggle {p.label}</span>
                <span
                  className={`${
                    p.enabled ? "translate-x-5" : "translate-x-1"
                  } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          ))}
        </div>
      </div>

      {/* Threshold Slider */}
      <div className="mt-6 flex items-center">
        <div className="w-24 text-sm">Sentiment ≥</div>
        <div className="flex-1 px-4">
          <input
            type="range"
            min={0}
            max={100}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="w-16 text-right font-semibold">{thresholdLabel}</div>
      </div>
    </div>
  );
}
