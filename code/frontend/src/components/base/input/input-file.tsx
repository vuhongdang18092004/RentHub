"use client";
import { InputSize } from "./input";

// TODO: Specialized file selector input.

export interface InputFileProps {
  label?: string;
  accept?: string;
  onChange?: (files: FileList | null) => void;
  size?: InputSize;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  multiple?: boolean;
  className?: string;
}

export function InputFile(props: InputFileProps) {
  return <div>TODO: InputFile</div>;
}
