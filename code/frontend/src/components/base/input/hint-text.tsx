"use client";
import { ReactNode } from "react";

// TODO: Helper or error message below input.

export type HintTextVariant = "default" | "error" | "success" | "warning";

export interface HintTextProps {
  children: ReactNode;
  variant?: HintTextVariant;
  className?: string;
}

export function HintText(props: HintTextProps) {
  return <div>TODO: HintText</div>;
}
