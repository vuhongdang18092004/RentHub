"use client";

// TODO: Auto-resize or standard multi-line textarea input.

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps {
  label?: string;
  placeholder?: string;
  hint?: string;
  size?: TextareaSize;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  autoResize?: boolean;
  className?: string;
}

export function Textarea(props: TextareaProps) {
  return <div>TODO: Textarea</div>;
}
