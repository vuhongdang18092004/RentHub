"use client";
import { AvatarSize, AvatarStatus } from "../avatar";

// TODO: Visual status dot indicator (online/offline).

export interface AvatarOnlineIndicatorProps {
  status?: AvatarStatus;
  size?: AvatarSize;
  className?: string;
}

export function AvatarOnlineIndicator(props: AvatarOnlineIndicatorProps) {
  return <div>TODO: AvatarOnlineIndicator</div>;
}
