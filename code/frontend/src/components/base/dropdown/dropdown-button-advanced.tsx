"use client";
import { ReactNode } from "react";

// TODO: Advanced dropdown trigger button.

export interface DropdownButtonAdvancedProps {
  children: ReactNode;
  isOpen?: boolean;
  iconLeading?: React.ComponentType<{ className?: string }> | ReactNode;
  iconTrailing?: React.ComponentType<{ className?: string }> | ReactNode;
  className?: string;
}

export function DropdownButtonAdvanced(props: DropdownButtonAdvancedProps) {
  return <div>TODO: DropdownButtonAdvanced</div>;
}
