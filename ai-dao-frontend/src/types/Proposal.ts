export interface Proposal {
  id: string;
  title: string;
  summary: string;
  aiDecision: 'yes' | 'no' | 'abstain';
  sentimentScore: number;
  reason: string;
  confidence: number;
  quotes?: string[];
  voted: boolean;
  explorerUrl: string;
}
