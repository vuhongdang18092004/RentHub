"use client";
import { ReactNode } from "react";

// TODO: Accessibility-friendly Checkbox component wrapper using React Aria.

export type CheckboxSize = "sm" | "md";

export interface CheckboxProps {
  size?: CheckboxSize;
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isIndeterminate?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Checkbox(props: CheckboxProps) {
  return <div>TODO: Checkbox</div>;
}
