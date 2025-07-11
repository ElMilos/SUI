import { CheckCircle, XCircle, Edit3 } from "lucide-react";
import type { Proposal } from "../types/Proposal";

interface ProposalCardProps {
  proposal: Proposal;
  onViewDetails: (proposal: Proposal) => void;
  onVote: (proposal: Proposal, decision: boolean) => void;
}

const statusStyles = {
  yes: "bg-green-100 text-green-800",
  no: "bg-red-100 text-red-800",
  abstain: "bg-yellow-100 text-yellow-800",
};

const statusIcons = {
  yes: <CheckCircle className="w-5 h-5 text-green-600" />,
  no: <XCircle className="w-5 h-5 text-red-600" />,
  abstain: <Edit3 className="w-5 h-5 text-yellow-600" />,
};

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onViewDetails,
  onVote,
}) => {
  const { title, summary, aiDecision, reason } = proposal;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 flex flex-col justify-between">
      {/* Header: title and status */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {summary}
        </p>
      </div>

      {/* AI Decision */}
      <div className="flex items-center mb-4">
        <span
          className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded-full ${statusStyles[aiDecision]}`}
        >
          {statusIcons[aiDecision]}
          <span className="ml-1 capitalize">{aiDecision}</span>
        </span>
      </div>

      {/* Reason snippet */}
      {reason && (
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {reason}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex space-x-2">
        <button
          onClick={() => onViewDetails(proposal)}
          className="flex-1 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900"
        >
          Details
        </button>
        <button
          onClick={() => onVote(proposal, aiDecision === "yes")}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Vote
        </button>
      </div>
    </div>
  );
};

export default ProposalCard;
