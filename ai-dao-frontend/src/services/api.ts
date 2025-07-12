import type { Proposal } from "../types";

declare const process: {
  env: Record<string, string>
} | undefined

const NODE_ENV = typeof process !== 'undefined'
  ? process.env.NODE_ENV
  : import.meta.env?.DEV
    ? 'development'
    : 'production'

const API_BASE = typeof process !== 'undefined'
  ? process.env.REACT_APP_API_URL || 'http://localhost:3001'
  : (import.meta.env?.VITE_API_URL ?? 'http://localhost:3001')

const USE_MOCK = NODE_ENV === 'development'

// Example mock data for local development
const mockProposals: Proposal[] = [
  {
    id: "0x1",
    title: "Increase Staking Rewards",
    aiDecision: "yes",
    sentimentScore: 0.8,
    confidence: 0.75,
    voted: false,
    date: "2025-06-25T12:00:00.000Z",
  },
  {
    id: "0x2",
    title: "Lower Gas Fees",
    aiDecision: "no",
    sentimentScore: 0.3,
    confidence: 0.6,
    voted: false,
    date: "2025-06-27T15:30:00.000Z",
  },
  {
    id: "0x3",
    title: "Introduce Referral Program",
    aiDecision: "yes",
    sentimentScore: 0.65,
    confidence: 0.7,
    voted: false,
    date: "2025-06-29T09:20:00.000Z",
  },
  {
    id: "0x4",
    title: "Pause New Proposals",
    aiDecision: "abstain",
    sentimentScore: 0.5,
    confidence: 0.55,
    voted: false,
    date: "2025-07-01T08:45:00.000Z",
  },
  {
    id: "0x5",
    title: "Launch Community Grant",
    aiDecision: "yes",
    sentimentScore: 0.9,
    confidence: 0.8,
    voted: false,
    date: "2025-07-01T08:45:00.000Z",
  },
  {
    id: "0x6",
    title: "Reduce Inflation Rate",
    aiDecision: "no",
    sentimentScore: 0.4,
    confidence: 0.65,
    voted: false,
    date: "2025-07-03T14:00:00.000Z",
  },
  {
    id: "0x7",
    title: "Integrate Oracle Data",
    aiDecision: "yes",
    sentimentScore: 0.75,
    confidence: 0.7,
    voted: false,
    date: "2025-07-04T10:30:00.000Z",
  },
  {
    id: "0x8",
    title: "Enable Meta-Governance",
    aiDecision: "abstain",
    sentimentScore: 0.55,
    confidence: 0.5,
    voted: false,
    date: "2025-07-05T16:45:00.000Z",
  },
  {
    id: "0x9",
    title: "UI/UX Redesign",
    aiDecision: "yes",
    sentimentScore: 0.85,
    confidence: 0.78,
    voted: false,
    date: "2025-07-06T13:15:00.000Z",
  },
  {
    id: "0xa",
    title: "Set Up Insurance Fund",
    aiDecision: "no",
    sentimentScore: 0.25,
    confidence: 0.6,
    voted: false,
    date: "2025-07-07T09:00:00.000Z",
  },
];

async function fetchDaoState() {
  const res = await fetch(`${API_BASE}/dao/state`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{
    id: { id: string };
    next_id: string;
    proposals: Array<{
      id: { id: string };
      title: string;
      description: string;
    }>;
  }>;
}

/**
 * Pobiera propozycje – z backendu jeśli działa, w przeciwnym razie z mocków
 */
export async function fetchProposals(): Promise<Proposal[]> {
  if (USE_MOCK) {
    // symulujemy delay
    await new Promise((r) => setTimeout(r, 500));
    return mockProposals;
  }

  try {
    const state = await fetchDaoState();
    // mapujemy on-chain → Proposal
    return state.proposals.map((p) => ({
      id: p.id.id, // bo backend zwraca { id: { id: "0x..." } }
      title: p.title,
      summary: p.description, // jeśli w type masz summary zamiast description
      aiDecision: "abstain", // lub 'yes'/'no' jeśli masz on-chain pole
      sentimentScore: 0,
      confidence: 0,
      voted: false,
      date: new Date().toISOString(),
    }));
  } catch (e) {
    console.warn("Backend unavailable, using mock:", (e as Error).message);
    return mockProposals;
  }
}
