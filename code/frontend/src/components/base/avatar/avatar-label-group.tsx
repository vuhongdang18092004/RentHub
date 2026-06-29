"use client";
import { ReactNode } from "react";
import { AvatarProps, AvatarSize } from "./avatar";

// TODO: AvatarLabelGroup component layout displaying Avatar alongside user's name/email.

export interface AvatarLabelGroupProps {
  name: string;
  email?: string;
  avatarProps?: AvatarProps;
  size?: AvatarSize;
  badge?: ReactNode;
  supportingText?: string;
  className?: string;
}

export function AvatarLabelGroup(props: AvatarLabelGroupProps) {
  return <div>TODO: AvatarLabelGroup</div>;
}
