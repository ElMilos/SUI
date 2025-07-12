import React from "react";
import type { Proposal } from "../types/Proposal";
import Gauge from "./Gauge";
import { UserCheck, Clock } from "lucide-react";

interface VotingFlowProps {
  proposals: Proposal[];
}

const VotingFlow: React.FC<VotingFlowProps> = ({ proposals }) => {
  const total = proposals.length;
  const votedCount = proposals.filter((p) => p.voted).length;
  const pendingCount = total - votedCount;
  const participation = total > 0 ? votedCount / total : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Voting Flow
      </h3>
      <Gauge label="Participation" value={participation} />

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {total}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
        </div>
        <div>
          <p className="flex items-center justify-center space-x-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            <UserCheck className="w-5 h-5 text-green-600" />
            <span>{votedCount}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Voted</p>
        </div>
        <div>
          <p className="flex items-center justify-center space-x-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span>{pendingCount}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
        </div>
      </div>
    </div>
  );
};

export default VotingFlow;
