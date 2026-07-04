"use client";
import { ReactNode } from "react";
import { Checkbox as AriaCheckbox } from "react-aria-components";

export type CheckboxSize = "sm" | "md";

export interface CheckboxProps {
  size?: CheckboxSize;
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isIndeterminate?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Checkbox({
  size = "md",
  isSelected,
  onChange,
  isDisabled = false,
  isInvalid = false,
  isIndeterminate = false,
  children,
  className = "",
}: CheckboxProps) {
  const sizeClasses = size === "sm" ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs";

  return (
    <AriaCheckbox
      isSelected={isSelected}
      onChange={onChange}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      isIndeterminate={isIndeterminate}
      className={`group flex items-center gap-2.5 font-sans font-semibold text-zinc-700 cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {({ isSelected: selected, isIndeterminate: indeterminate }) => (
        <>
          <div
            className={`${sizeClasses} shrink-0 rounded-md border flex items-center justify-center transition-all ${
              selected || indeterminate
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-white border-zinc-300 hover:border-zinc-400 group-focus:ring-2 group-focus:ring-violet-500/20"
            }`}
          >
            {indeterminate ? (
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                <rect x="4" y="10" width="16" height="4" rx="1" />
              </svg>
            ) : selected ? (
              <svg className="w-3 h-3 fill-none stroke-current stroke-[3px]" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : null}
          </div>
          {children && <span className="text-xs leading-none">{children}</span>}
        </>
      )}
    </AriaCheckbox>
  );
}
