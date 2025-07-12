import React, { useEffect, useState } from 'react';
import { fetchProposals, voteOnProposal } from '../services/api';
import ProposalCard from './ProposalCard';
import DetailsPanel from './DetailsPanel';
import type { Proposal } from '../types/Proposal';

const AgentModule: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchProposals();
        setProposals(data);
      } catch (err) {
        console.error('Error fetching proposals', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const onViewDetails = (proposal: Proposal) => {
    setSelected(proposal);
  };

  const onClose = () => {
    setSelected(null);
  };

  const onVote = async (proposal: Proposal, decision: boolean) => {
    try {
      await voteOnProposal(proposal.id, decision);
      // Update UI
      setProposals(prev => prev.map(p => p.id === proposal.id ? { ...p, voted: true, aiDecision: decision ? 'yes' : 'no' } : p));
      setSelected(null);
    } catch (err) {
      console.error('Voting error', err);
    }
  };

  return (
    <div className="space-y-4">
      {loading && <p className="text-center text-gray-500">Loading proposals...</p>}
      {!loading && proposals.length === 0 && <p className="text-center text-gray-500">No active proposals.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map(p => (
          <ProposalCard
            key={p.id}
            proposal={p}
            onViewDetails={onViewDetails}
            onVote={onVote}
          />
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-end">
          <div className="m-6">
            <DetailsPanel
              proposal={selected}
              onClose={onClose}
              onVote={onVote}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentModule;
