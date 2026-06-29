"use client";
import { ReactNode } from "react";

// TODO: Avatar component handles avatar rendering (src, initials, status online/offline, verified badge, count badge) with fallbacks.

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarStatus = "online" | "offline";

export interface AvatarProps {
  size?: AvatarSize;
  status?: AvatarStatus;
  verified?: boolean;
  count?: number;
  src?: string | null;
  alt?: string;
  initials?: string;
  border?: boolean;
  placeholderIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function Avatar(props: AvatarProps) {
  return <div>TODO: Avatar</div>;
}
