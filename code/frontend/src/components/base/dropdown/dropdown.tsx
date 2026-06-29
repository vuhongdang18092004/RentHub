"use client";
import { ReactNode } from "react";

// TODO: Base dropdown container that handles popup menu display.

export type DropdownPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end" | "left-start" | "right-start";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  placement?: DropdownPlacement;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
}

export function Dropdown(props: DropdownProps) {
  return <div>TODO: Dropdown</div>;
}
