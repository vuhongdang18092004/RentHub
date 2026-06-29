"use client";
import { SelectSize } from "./select";
import { SelectItemProps } from "./select-item";

// TODO: Selection list rendered as tags.

export interface TagSelectProps {
  label?: string;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  items: SelectItemProps[];
  size?: SelectSize;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function TagSelect(props: TagSelectProps) {
  return <div>TODO: TagSelect</div>;
}
