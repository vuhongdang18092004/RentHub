"use client";
import { ReactNode } from "react";

// TODO: Social buttons supporting Google, Apple, etc. authentication.

export type SocialBrand = "google" | "apple" | "facebook" | "twitter" | "github";
export type SocialButtonSize = "sm" | "md" | "lg";
export type SocialButtonVariant = "filled" | "outline" | "transparent";

export interface SocialButtonProps {
  brand: SocialBrand;
  size?: SocialButtonSize;
  variant?: SocialButtonVariant;
  isDisabled?: boolean;
  onButtonClick?: () => void;
  children?: ReactNode;
  className?: string;
}

export function SocialButton(props: SocialButtonProps) {
  return <div>TODO: SocialButton</div>;
}
