"use client";
import { ReactNode } from "react";

// TODO: Sliding switch toggle component.

export type ToggleSize = "sm" | "md";

export interface ToggleProps {
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  size?: ToggleSize;
  children?: ReactNode;
  className?: string;
}

export function Toggle(props: ToggleProps) {
  return <div>TODO: Toggle</div>;
}
