"use client";
import { InputSize } from "./input";

// TODO: Number input hiding spin arrows.

export interface InputNumberProps {
  label?: string;
  value?: number;
  onChange?: (value: number | null) => void;
  size?: InputSize;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function InputNumber(props: InputNumberProps) {
  return <div>TODO: InputNumber</div>;
}
