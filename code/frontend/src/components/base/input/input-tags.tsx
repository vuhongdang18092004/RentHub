"use client";
import { InputSize } from "./input";

// TODO: Interactive tag entry input component.

export interface InputTagsProps {
  label?: string;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
  size?: InputSize;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function InputTags(props: InputTagsProps) {
  return <div>TODO: InputTags</div>;
}
