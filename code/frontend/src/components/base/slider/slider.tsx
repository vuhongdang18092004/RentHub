"use client";

// TODO: Slider input component.

export type SliderSize = "sm" | "md" | "lg";

export interface SliderProps {
  value?: number | number[];
  onChange?: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: SliderSize;
  isDisabled?: boolean;
  className?: string;
}

export function Slider(props: SliderProps) {
  return <div>TODO: Slider</div>;
}
