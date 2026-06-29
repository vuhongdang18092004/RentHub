"use client";

// TODO: Progress bar indicator.

export type ProgressBarSize = "sm" | "md" | "lg";
export type ProgressBarColor = "brand" | "neutral" | "success" | "error";

export interface ProgressIndicatorsProps {
  value: number; // 0 to 100
  max?: number;
  size?: ProgressBarSize;
  color?: ProgressBarColor;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressIndicators(props: ProgressIndicatorsProps) {
  return <div>TODO: ProgressIndicators</div>;
}
