"use client";
import { ReactNode } from "react";

// TODO: Tooltip trigger and popover container.

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  title: ReactNode;
  placement?: TooltipPlacement;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children: ReactNode;
  className?: string;
}

export function Tooltip(props: TooltipProps) {
  return <div>TODO: Tooltip</div>;
}

export interface TooltipTriggerProps {
  children: ReactNode;
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <div>TODO: TooltipTrigger</div>;
}
