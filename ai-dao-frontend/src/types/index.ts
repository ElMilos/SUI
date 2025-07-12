import type { Range } from 'react-date-range';

export interface HeaderControlsProps {
  dateRangeLabel: string;
  onOpenDate: () => void;
  onToggleFilter: () => void;
  onOpenAddView: () => void;
  isFilterOpen: boolean;
}

export interface FilterPanelProps {
  filters: Record<"yes" | "no" | "abstain", boolean>;
  onToggle: (key: "yes" | "no" | "abstain") => void;
}

export interface MetricsSectionProps {
  total: number;
  avgSentiment: number;
  participation: number;
  sentimentTrend: Array<{ x: string; y: number }>;
}

export interface ChartsSectionProps {
  proposalTrend: Array<{ date: string; count: number }>;
  sentimentTrend: Array<{ x: string; y: number }>;
}
// nowy interfejs dla SideChart
export interface SideChartProps {
  voteDistribution: Array<{ category: string; count: number }>;
}

export interface AddViewModalProps {
  isOpen: boolean;
  name: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export type { Range };

export interface Proposal {
  sentiment: number;
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

export interface DecisionFlowProps {
  proposals: Proposal[];
  threshold: number;
}