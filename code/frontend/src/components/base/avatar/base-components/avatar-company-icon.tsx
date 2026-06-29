"use client";
import { AvatarSize } from "../avatar";

// TODO: Specialized icon display for companies.

export interface AvatarCompanyIconProps {
  size?: AvatarSize;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function AvatarCompanyIcon(props: AvatarCompanyIconProps) {
  return <div>TODO: AvatarCompanyIcon</div>;
}
