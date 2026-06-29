"use client";
import { ReactNode } from "react";

// TODO: Accessible popover overlay component for select dropdowns.

export interface PopoverProps {
  triggerRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Popover(props: PopoverProps) {
  return <div>TODO: Popover</div>;
}
