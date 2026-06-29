"use client";

// TODO: Circular progress indicators.

export type ProgressCircleSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ProgressCircleColor = "brand" | "success" | "warning" | "error";

export interface ProgressCirclesProps {
  value: number; // 0 to 100
  size?: ProgressCircleSize;
  color?: ProgressCircleColor;
  showLabel?: boolean;
  className?: string;
}

export function ProgressCircles(props: ProgressCirclesProps) {
  return <div>TODO: ProgressCircles</div>;
}
