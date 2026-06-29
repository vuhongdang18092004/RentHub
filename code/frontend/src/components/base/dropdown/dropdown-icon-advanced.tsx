"use client";
import { ReactNode } from "react";

// TODO: Icon-only advanced dropdown trigger.

export interface DropdownIconAdvancedProps {
  icon: React.ComponentType<{ className?: string }> | ReactNode;
  isOpen?: boolean;
  className?: string;
}

export function DropdownIconAdvanced(props: DropdownIconAdvancedProps) {
  return <div>TODO: DropdownIconAdvanced</div>;
}
