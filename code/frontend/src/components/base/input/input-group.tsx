"use client";
import { ReactNode } from "react";
import { InputSize } from "./input";

// TODO: Input field grouped with leading/trailing elements/addons.

export interface InputGroupProps {
  size?: InputSize;
  addonLeading?: ReactNode;
  addonTrailing?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function InputGroup(props: InputGroupProps) {
  return <div>TODO: InputGroup</div>;
}
