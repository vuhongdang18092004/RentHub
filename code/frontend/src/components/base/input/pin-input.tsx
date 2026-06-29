"use client";

// TODO: One-Time Password (OTP) pin entry inputs.

export type PinLength = 4 | 6;

export interface PinInputProps {
  length?: PinLength;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  className?: string;
}

export function PinInput(props: PinInputProps) {
  return <div>TODO: PinInput</div>;
}
