"use client";
import { ReactNode } from "react";

// TODO: Form component wrapping form inputs.

export interface FormProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
}

export function Form(props: FormProps) {
  return <div>TODO: Form</div>;
}
