import React from 'react';
import { format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import type { Proposal } from '../types';

interface LastProposalCardProps {
  proposal: Proposal;
}

const LastProposalCard: React.FC<LastProposalCardProps> = ({ proposal }) => {
  const { darkMode } = useTheme();
  const containerClass = `rounded-lg shadow p-6 transition-colors duration-200 ${
    darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
  }`;

  return (
    <div className={containerClass}>
      <h3 className="text-lg font-semibold mb-2">Last Proposal</h3>
      <p className="text-sm">
        Title: <span className="font-medium">{proposal.title}</span>
      </p>
      <p className="text-sm">
        Date: <span className="font-medium">{format(new Date(proposal.date), 'PPP')}</span>
      </p>
      <p className="mt-2 text-xs text-gray-400">ID: {proposal.id}</p>
    </div>
  );
};

export default LastProposalCard;
