"use client";

import { ReactNode } from "react";

export interface FormProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
}

export function Form({ onSubmit, children, className = "" }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
}
