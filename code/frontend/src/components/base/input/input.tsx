"use client";
import { ReactNode } from "react";

// TODO: Text field input wrapper based on React Aria TextField.

export type InputSize = "sm" | "md" | "lg";
export type InputType = "text" | "email" | "password" | "search" | "tel" | "url";

export interface InputProps {
  label?: string;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }> | ReactNode;
  hint?: string;
  size?: InputSize;
  type?: InputType;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  className?: string;
}

export function Input(props: InputProps) {
  return <div>TODO: Input</div>;
}
