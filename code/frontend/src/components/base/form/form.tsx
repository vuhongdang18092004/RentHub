"use client";

import { ReactNode } from "react";

export interface FormProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
  noValidate?: boolean;
}

export function Form({ onSubmit, children, className = "", noValidate = true }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`} noValidate={noValidate}>
      {children}
    </form>
  );
}
