"use client";
import { ReactNode } from "react";
import { SelectSize } from "./select";
import { SelectItemProps } from "./select-item";

// TODO: Native HTML select wrapper for accessibility/fallback.

export interface SelectNativeProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  items: SelectItemProps[];
  size?: SelectSize;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function SelectNative(props: SelectNativeProps) {
  return <div>TODO: SelectNative</div>;
}
