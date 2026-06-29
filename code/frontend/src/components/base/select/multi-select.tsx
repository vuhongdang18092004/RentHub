"use client";
import { SelectSize } from "./select";
import { SelectItemProps } from "./select-item";

// TODO: Multiple selection dropdown.

export interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  items: SelectItemProps[];
  size?: SelectSize;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function MultiSelect(props: MultiSelectProps) {
  return <div>TODO: MultiSelect</div>;
}
