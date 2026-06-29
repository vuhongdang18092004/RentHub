"use client";
import { ReactNode } from "react";

// TODO: Icon-only simple dropdown trigger.

export interface DropdownIconSimpleProps {
  icon: React.ComponentType<{ className?: string }> | ReactNode;
  isOpen?: boolean;
  className?: string;
}

export function DropdownIconSimple(props: DropdownIconSimpleProps) {
  return <div>TODO: DropdownIconSimple</div>;
}
