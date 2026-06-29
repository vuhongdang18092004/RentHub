"use client";
import { ReactNode } from "react";

// TODO: Standard static or interactive tag badge.

export type TagSize = "sm" | "md" | "lg";
export type TagColor = "gray" | "brand" | "error" | "warning" | "success" | "blue" | "indigo" | "purple";

export interface TagsProps {
  size?: TagSize;
  color?: TagColor;
  iconLeading?: React.ComponentType<{ className?: string }> | ReactNode;
  iconTrailing?: React.ComponentType<{ className?: string }> | ReactNode;
  children: ReactNode;
  onClose?: () => void;
  onClick?: () => void;
  className?: string;
}

export function Tags(props: TagsProps) {
  return <div>TODO: Tags</div>;
}
