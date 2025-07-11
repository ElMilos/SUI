import React from "react";
import { X, Check } from "lucide-react";
import type { Proposal } from "../types/Proposal";
import Gauge from "./Gauge";

interface DetailsPanelProps {
  proposal: Proposal;
  onClose: () => void;
  onVote: (proposal: Proposal, decision: boolean) => void;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({
  proposal,
  onClose,
  onVote,
}) => {
  const { title, summary, sentimentScore, confidence, quotes } = proposal;
  const sentiment = sentimentScore ?? 0;
  const conf = confidence ?? 0;

  return (
    <div className="bg-white dark:bg-gray-900 w-96 p-6 rounded-lg shadow-lg">
      {/* Close button */}
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Close
      </button>

      {/* Title & Summary */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4">
        {title}
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{summary}</p>

      {/* Gauges */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Gauge label="Sentiment" value={sentiment} color="#10B981" />
        <Gauge label="Confidence" value={conf} color="#6366F1" />
      </div>

      {/* Top Quotes */}
      {quotes && quotes.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
            Top Quotes
          </h4>
          <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {quotes.map((q, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-700 dark:text-gray-200 italic"
              >
                "{q}"
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vote Actions */}
      <div className="mt-6 flex space-x-2">
        <button
          onClick={() => onVote(proposal, true)}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
        >
          <Check className="w-4 h-4 mr-2" />
          Vote Yes
        </button>
        <button
          onClick={() => onVote(proposal, false)}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
        >
          <X className="w-4 h-4 mr-2" />
          Vote No
        </button>
      </div>
    </div>
  );
};

export default DetailsPanel;
