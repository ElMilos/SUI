import type { Proposal } from '../types';
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
    summary: 'Bump staking rewards from 5% to 7%',
    explorerUrl: '',
    aiDecision: 'yes',
    reason: 'Off-chain sentiment ~80% pozytywów',
    sentiment: 0.8,
    sentimentScore: 0.8,
    confidence: 0.75,
    voted: false,
    quotes: ['Więcej rewardów!', 'Super pomysł.'],
    date: '2025-06-25T12:00:00.000Z',
  },
  {
    id: '0x2',
    title: 'Lower Gas Fees',
    summary: 'Subsidize gas for small TX',
    explorerUrl: '',
    aiDecision: 'no',
    reason: 'Obawy o koszty',
    sentiment: 0.3,
    sentimentScore: 0.3,
    confidence: 0.6,
    voted: false,
    quotes: ['Za drogo.', 'Lepiej optymalizować.'],
    date: '2025-06-27T15:30:00.000Z',
  },
  {
    id: '0x3',
    title: 'Introduce Referral Program',
    summary: 'Reward users for inviting friends',
    explorerUrl: '',
    aiDecision: 'yes',
    reason: 'Sentyment ~65%',
    sentiment: 0.65,
    sentimentScore: 0.65,
    confidence: 0.7,
    voted: false,
    quotes: ['Super sposób na wzrost.', 'Zachęci nowych.'],
    date: '2025-06-29T09:20:00.000Z',
  },
  {
    id: '0x4',
    title: 'Pause New Proposals',
    summary: 'Temporary proposal freeze for audit',
    explorerUrl: '',
    aiDecision: 'abstain',
    reason: 'Podzielone opinie',
    sentiment: 0.5,
    sentimentScore: 0.5,
    confidence: 0.55,
    voted: false,
    quotes: ['Potrzebny audyt.', 'Może być ryzykowne.'],
    date: '2025-07-01T08:45:00.000Z',
  },
  {
    id: '0x5',
    title: 'Launch Community Grant',
    summary: 'Fund small dev grants',
    explorerUrl: '',
    aiDecision: 'yes',
    reason: 'Entuzjazm ~90%',
    sentiment: 0.9,
    sentimentScore: 0.9,
    confidence: 0.8,
    voted: false,
    quotes: ['Fantastyczne!', 'Wspierajmy devów.'],
    date: '2025-07-01T08:45:00.000Z',
  },
  {
    id: '0x6',
    title: 'Reduce Inflation Rate',
    summary: 'Drop annual inflation from 3% to 2%',
    explorerUrl: '',
    aiDecision: 'no',
    reason: 'Zbyt małe rezerwy',
    sentiment: 0.4,
    sentimentScore: 0.4,
    confidence: 0.65,
    voted: false,
    quotes: ['Ryzyko deflacji.', 'Lepiej stopniowo.'],
    date: '2025-07-03T14:00:00.000Z',
  },
  {
    id: '0x7',
    title: 'Integrate Oracle Data',
    summary: 'Add external price oracles',
    explorerUrl: '',
    aiDecision: 'yes',
    reason: 'Wsparcie z ~75%',
    sentiment: 0.75,
    sentimentScore: 0.75,
    confidence: 0.7,
    voted: false,
    quotes: ['Bardzo potrzebne.', 'Poprawi bezpieczeństwo.'],
    date: '2025-07-04T10:30:00.000Z',
  },
  {
    id: '0x8',
    title: 'Enable Meta-Governance',
    summary: 'Allow cross-chain DAO votes',
    explorerUrl: '',
    aiDecision: 'abstain',
    reason: 'Za mało danych',
    sentiment: 0.55,
    sentimentScore: 0.55,
    confidence: 0.5,
    voted: false,
    quotes: ['Musimy rozważyć ryzyko.', 'Potencjał, ale ostrożnie.'],
    date: '2025-07-05T16:45:00.000Z',
  },
  {
    id: '0x9',
    title: 'UI/UX Redesign',
    summary: 'Full dashboard overhaul',
    explorerUrl: '',
    aiDecision: 'yes',
    reason: 'Pozytywne feedbacki ~85%',
    sentiment: 0.85,
    sentimentScore: 0.85,
    confidence: 0.78,
    voted: false,
    quotes: ['Ładniej i czytelniej.', 'Potrzebne UX.'],
    date: '2025-07-06T13:15:00.000Z',
  },
  {
    id: '0xa',
    title: 'Set Up Insurance Fund',
    summary: 'Reserve for smart-contract hacks',
    explorerUrl: '',
    aiDecision: 'no',
    reason: 'Za drogie',
    sentiment: 0.25,
    sentimentScore: 0.25,
    confidence: 0.6,
    voted: false,
    quotes: ['Budżet nie wytrzyma.', 'Inne priorytety.'],
    date: '2025-07-07T09:00:00.000Z',
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
    sentiment: 0, // Added missing property
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
