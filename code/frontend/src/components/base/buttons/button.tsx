"use client";
import { ReactNode } from "react";

// TODO: Button component supporting primary, secondary, link, and destructive styles using React Aria.

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ButtonColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "link-color"
  | "link-gray"
  | "primary-destructive"
  | "secondary-destructive"
  | "tertiary-destructive"
  | "link-destructive";

export interface ButtonProps {
  size?: ButtonSize;
  color?: ButtonColor;
  isLoading?: boolean;
  isDisabled?: boolean;
  iconLeading?: React.ComponentType<{ className?: string }> | ReactNode;
  iconTrailing?: React.ComponentType<{ className?: string }> | ReactNode;
  href?: string;
  children?: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
}

export function Button(props: ButtonProps) {
  return <div>TODO: Button</div>;
}
