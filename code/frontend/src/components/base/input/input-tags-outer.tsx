"use client";
import { InputSize } from "./input";

// TODO: Interactive tag entry layout with tags on the outer container.

export interface InputTagsOuterProps {
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

export function InputTagsOuter(props: InputTagsOuterProps) {
  return <div>TODO: InputTagsOuter</div>;
}
