"use client";
import { ReactNode } from "react";

// TODO: ButtonGroup component grouping buttons with unified styling.

export type ButtonGroupSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonGroupOrientation = "horizontal" | "vertical";

export interface ButtonGroupProps {
  size?: ButtonGroupSize;
  orientation?: ButtonGroupOrientation;
  children: ReactNode;
  className?: string;
}

export function ButtonGroup(props: ButtonGroupProps) {
  return <div>TODO: ButtonGroup</div>;
}
