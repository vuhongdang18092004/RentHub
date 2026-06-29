"use client";
import { ReactNode } from "react";

// TODO: Radio selection list components.

export type RadioSize = "sm" | "md";

export interface RadioItem {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  isDisabled?: boolean;
}

export interface RadioButtonsProps {
  name: string;
  options: RadioItem[];
  value?: string;
  onChange?: (value: string) => void;
  size?: RadioSize;
  isDisabled?: boolean;
  isInvalid?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function RadioButtons(props: RadioButtonsProps) {
  return <div>TODO: RadioButtons</div>;
}
