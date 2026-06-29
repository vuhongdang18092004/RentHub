"use client";
import { ReactNode } from "react";
import { TagSize, TagColor } from "../tags";

// TODO: Checkbox selector rendered as a tag.

export interface TagCheckboxProps {
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  size?: TagSize;
  color?: TagColor;
  children: ReactNode;
  isDisabled?: boolean;
  className?: string;
}

export function TagCheckbox(props: TagCheckboxProps) {
  return <div>TODO: TagCheckbox</div>;
}
