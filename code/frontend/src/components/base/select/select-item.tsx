"use client";
import { ReactNode } from "react";

// TODO: Select option item component.

export interface SelectItemProps {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }> | ReactNode;
  isDisabled?: boolean;
}

export function SelectItem(props: SelectItemProps) {
  return <div>TODO: SelectItem</div>;
}
