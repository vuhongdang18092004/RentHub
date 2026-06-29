"use client";
import { ReactNode } from "react";

// TODO: ButtonUtility for utility icon-only buttons with tooltips.

export type ButtonUtilitySize = "xs" | "sm";
export type ButtonUtilityColor = "secondary" | "tertiary";

export interface ButtonUtilityProps {
  size?: ButtonUtilitySize;
  color?: ButtonUtilityColor;
  icon: React.ComponentType<{ className?: string }> | ReactNode;
  tooltip?: string;
  tooltipPlacement?: "top" | "bottom" | "left" | "right";
  isDisabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ButtonUtility(props: ButtonUtilityProps) {
  return <div>TODO: ButtonUtility</div>;
}
