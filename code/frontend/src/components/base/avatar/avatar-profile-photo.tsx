"use client";
import { AvatarSize } from "./avatar";

// TODO: AvatarProfilePhoto component for larger profile image variants with editing capability.

export interface AvatarProfilePhotoProps {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  onPhotoChange?: (file: File) => void;
  onPhotoDelete?: () => void;
  isDisabled?: boolean;
  isEditable?: boolean;
  className?: string;
}

export function AvatarProfilePhoto(props: AvatarProfilePhotoProps) {
  return <div>TODO: AvatarProfilePhoto</div>;
}
