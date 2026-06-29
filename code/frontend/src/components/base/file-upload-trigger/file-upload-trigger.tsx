"use client";
import { ReactNode } from "react";

// TODO: File upload click/drag trigger.

export type FileUploadVariant = "drag" | "button" | "avatar";

export interface FileUploadTriggerProps {
  variant?: FileUploadVariant;
  accept?: string;
  multiple?: boolean;
  onFileSelect?: (files: FileList) => void;
  isDisabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export function FileUploadTrigger(props: FileUploadTriggerProps) {
  return <div>TODO: FileUploadTrigger</div>;
}
