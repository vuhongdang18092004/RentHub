"use client";
import { SelectSize } from "./select";
import { SelectItemProps } from "./select-item";

// TODO: Searchable select combobox.

export interface ComboboxProps {
  label?: string;
  placeholder?: string;
  selectedKey?: string;
  onSelectionChange?: (key: string) => void;
  items: SelectItemProps[];
  size?: SelectSize;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  className?: string;
}

export function Combobox(props: ComboboxProps) {
  return <div>TODO: Combobox</div>;
}
