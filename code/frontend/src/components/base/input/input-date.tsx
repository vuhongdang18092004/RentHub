"use client";
import { InputSize } from "./input";

// TODO: Date field input component.

export interface InputDateProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  size?: InputSize;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export function InputDate(props: InputDateProps) {
  return <div>TODO: InputDate</div>;
}
