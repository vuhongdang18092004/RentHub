"use client";
import { AvatarSize } from "../avatar";

// TODO: Button component inside avatar container for adding new photos/members.

export interface AvatarAddButtonProps {
  size?: AvatarSize;
  onClick?: () => void;
  isDisabled?: boolean;
  className?: string;
}

export function AvatarAddButton(props: AvatarAddButtonProps) {
  return <div>TODO: AvatarAddButton</div>;
}
