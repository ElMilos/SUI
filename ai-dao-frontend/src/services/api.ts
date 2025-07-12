import type { Proposal } from '../types/Proposal';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// Initialize Sui client for testnet
const client = new SuiClient({
  url: 'https://fullnode.testnet.sui.io:443',
});

// Address of the DAO contract on SUI testnet (replace with actual)
const DAO_MODULE = '0xYourDaoModuleAddress';
// Sender address for devInspect (replace with valid SUI address)
const DEV_INSPECT_SENDER = '0x0000000000000000000000000000000000000000';

// Toggle mocking of backend and on-chain calls
const USE_MOCK = process.env.NODE_ENV === 'development';

// Example mock data for local development
const mockProposals: Proposal[] = [
  {
    id: '0x1',
    title: 'Increase Staking Rewards',
    summary: 'Proposal to bump staking rewards from 5% to 7%',
    explorerUrl: '',
    aiDecision: 'yes',
    reason: 'Off-chain sentiment ~80% pozytywów',
    sentimentScore: 0.8,
    confidence: 0.7,
    voted: false,
    quotes: [
      'Great idea, więcej rewardów!',
      'Zachęci więcej użytkowników.'
    ],
    date: '2025-07-01T00:00:00.000Z'
  },
  {
    id: '0x2',
    title: 'Lower Gas Fees',
    summary: 'Proposal to subsidize gas for small TX',
    explorerUrl: '',
    aiDecision: 'no',
    reason: 'Większość obaw o koszt subsidiów',
    sentimentScore: 0.3,
    confidence: 0.6,
    voted: false,
    quotes: [
      'To będzie kosztować za dużo.',
      'Lepiej szukać optymalizacji.'
    ],
    date: '2025-07-02T00:00:00.000Z'
  },
];

/**
 * Fetch active proposals and on-chain vote results
 */
export async function fetchProposals(): Promise<Proposal[]> {
  if (USE_MOCK) {
    // Simulate network delay
    return new Promise((resolve) => setTimeout(() => resolve(mockProposals), 500));
  }

  const tx = new Transaction();
  tx.moveCall({
    target: `${DAO_MODULE}::dao::get_active_proposals`,
    arguments: [],
  });

  const result = await client.devInspectTransactionBlock({
    sender: DEV_INSPECT_SENDER,
    transactionBlock: tx,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (result.results?.[0].returnValues?.[0] ?? []) as any[];
  const proposals: Proposal[] = raw.map((p) => ({
    id: String(p.id),
    title: String(p.title),
    summary: String(p.summary),
    explorerUrl: `https://explorer.sui.io/objects/${p.id}?network=testnet`,
    aiDecision: 'no',
    reason: '',
    sentimentScore: 0,
    confidence: 0,
    voted: false,
    quotes: [],
    date: '', // Add a default value or extract from p if available
  }));

  return proposals;
}

/**
 * Create or simulate a transaction block for voting on a proposal
 */
export async function voteOnProposal(
  proposalId: string,
  decision: boolean
): Promise<Transaction | void> {
  if (USE_MOCK) {
    // Simulate vote processing delay
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        console.log(`Mock vote: ${proposalId} → ${decision}`);
        resolve();
      }, 300)
    );
  }

  const tx = new Transaction();
  tx.moveCall({
    target: `${DAO_MODULE}::dao::vote`,
    arguments: [
      tx.object(proposalId),
      tx.pure.bool(decision),
    ],
  });
  return tx;
}
