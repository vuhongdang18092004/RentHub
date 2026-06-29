"use client";
import { ReactNode } from "react";

// TODO: Floating/static input label component.

export interface LabelProps {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export function Label(props: LabelProps) {
  return <div>TODO: Label</div>;
}
