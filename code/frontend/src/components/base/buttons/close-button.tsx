"use client";

// TODO: CloseButton specialized for dismissing modals, popovers, or banners.

export type CloseButtonSize = "xs" | "sm" | "md" | "lg";

export interface CloseButtonProps {
  size?: CloseButtonSize;
  onClose?: () => void;
  isDisabled?: boolean;
  className?: string;
}

export function CloseButton(props: CloseButtonProps) {
  return <div>TODO: CloseButton</div>;
}
