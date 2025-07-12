export interface Proposal {
  date: string | number | Date;
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
