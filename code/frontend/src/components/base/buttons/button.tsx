"use client";

import { ReactNode } from "react";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { cx } from "@/utils/cx";
import { isReactComponent } from "@/utils/is-react-component";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ButtonColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "link-color"
  | "link-gray"
  | "primary-destructive"
  | "secondary-destructive"
  | "tertiary-destructive"
  | "link-destructive";

export interface ButtonProps {
  size?: ButtonSize;
  color?: ButtonColor;
  isLoading?: boolean;
  isDisabled?: boolean;
  iconLeading?: React.ComponentType<{ className?: string }> | ReactNode;
  iconTrailing?: React.ComponentType<{ className?: string }> | ReactNode;
  href?: string;
  children?: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
}

export function Button({
  size = "sm",
  color = "primary",
  isLoading = false,
  isDisabled = false,
  iconLeading,
  iconTrailing,
  href,
  children,
  className = "",
  type = "button",
  onClick,
  ...otherProps
}: ButtonProps) {
  const Component = href ? AriaLink : AriaButton;
  
  // Style styles mappings using Tailwind V4 theme tokens
  const sizeStyles = {
    xs: "px-2.5 py-1.5 text-xs rounded-lg gap-1.5",
    sm: "px-3 py-2 text-sm rounded-lg gap-2",
    md: "px-4 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-4.5 py-3 text-md rounded-xl gap-2",
    xl: "px-5.5 py-3.5 text-md rounded-2xl gap-2.5",
  };

  const colorStyles = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500 shadow-sm border border-transparent active:bg-brand-800",
    secondary: "bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-300 focus-visible:ring-brand-500 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700",
    tertiary: "bg-transparent text-zinc-600 hover:bg-zinc-50 focus-visible:ring-brand-500 dark:text-zinc-300 dark:hover:bg-zinc-800",
    "link-color": "bg-transparent p-0 text-brand-600 hover:text-brand-700 hover:underline focus-visible:ring-brand-500",
    "link-gray": "bg-transparent p-0 text-zinc-500 hover:text-zinc-700 hover:underline focus-visible:ring-zinc-400",
    "primary-destructive": "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm border border-transparent",
    "secondary-destructive": "bg-white text-red-600 hover:bg-red-50 border border-red-200 focus-visible:ring-red-500",
    "tertiary-destructive": "bg-transparent text-red-600 hover:bg-red-50 focus-visible:ring-red-500",
    "link-destructive": "bg-transparent p-0 text-red-600 hover:text-red-700 hover:underline focus-visible:ring-red-500",
  };

  const isLink = color.startsWith("link-");
  const baseClasses = "relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const renderIcon = (icon: ReactNode | React.ComponentType<{ className?: string }>) => {
    if (!icon) return null;
    if (isReactComponent(icon)) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-5 h-5 flex-shrink-0" />;
    }
    return <span className="flex-shrink-0">{icon as ReactNode}</span>;
  };

  return (
    <Component
      {...(href ? { href } : { type })}
      isDisabled={isDisabled || isLoading}
      onPress={onClick as any}
      className={cx(
        baseClasses,
        !isLink && sizeStyles[size],
        colorStyles[color],
        isLoading && "text-transparent! select-none pointer-events-none",
        className
      )}
      {...(otherProps as any)}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}
      
      {/* Content */}
      <span className="inline-flex items-center gap-inherit">
        {renderIcon(iconLeading)}
        {children}
        {renderIcon(iconTrailing)}
      </span>
    </Component>
  );
}
