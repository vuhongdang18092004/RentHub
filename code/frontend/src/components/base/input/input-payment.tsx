"use client";
import { InputSize } from "./input";

// TODO: Credit card or payment details input.

export interface InputPaymentProps {
  label?: string;
  size?: InputSize;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  onCardDetailsChange?: (details: { number: string; expiry: string; cvc: string }) => void;
  className?: string;
}

export function InputPayment(props: InputPaymentProps) {
  return <div>TODO: InputPayment</div>;
}
