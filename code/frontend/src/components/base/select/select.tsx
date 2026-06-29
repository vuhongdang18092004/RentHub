"use client";
import { ReactNode } from "react";
import { SelectItemProps } from "./select-item";

// TODO: Standard custom select dropdown based on React Aria.

export type SelectSize = "sm" | "md" | "lg";

export interface SelectProps {
  label?: string;
  placeholder?: string;
  selectedKey?: string;
  onSelectionChange?: (key: string) => void;
  items: SelectItemProps[];
  size?: SelectSize;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  hint?: string;
  className?: string;
}

export function Select(props: SelectProps) {
  return <div>TODO: Select</div>;
}
