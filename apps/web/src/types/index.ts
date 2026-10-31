export * from '@grand-bandhan/shared';

export interface UIState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: any;
  trend?: string;
}
