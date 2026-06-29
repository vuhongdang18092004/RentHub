"use client";

import { ReactNode, useState, forwardRef } from "react";
import { TextField as AriaTextField, Input as AriaInput, Label as AriaLabel, Text as AriaText, Group as AriaGroup } from "react-aria-components";
import { cx } from "@/utils/cx";
import { isReactComponent } from "@/utils/is-react-component";
import { Eye, EyeOff } from "@untitledui/icons";

export type InputSize = "sm" | "md" | "lg";
export type InputType = "text" | "email" | "password" | "search" | "tel" | "url";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  label?: string;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }> | ReactNode;
  hint?: string;
  size?: InputSize;
  type?: InputType;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  name?: string;
  className?: string;
  autoComplete?: string;
  error?: string;
}

// Wrapping with forwardRef for react-hook-form integration
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  placeholder,
  icon,
  hint,
  size = "md",
  type = "text",
  isRequired = false,
  isInvalid = false,
  isDisabled = false,
  value,
  onChange,
  name,
  className = "",
  autoComplete,
  error,
  ...otherProps
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg min-h-8",
    md: "px-4 py-2.5 text-sm rounded-xl min-h-10",
    lg: "px-4.5 py-3 text-md rounded-xl min-h-12",
  };

  const renderIcon = (inputIcon: ReactNode | React.ComponentType<{ className?: string }>) => {
    if (!inputIcon) return null;
    if (isReactComponent(inputIcon)) {
      const IconComponent = inputIcon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />;
    }
    return <span className="text-zinc-400 dark:text-zinc-500">{inputIcon as ReactNode}</span>;
  };

  return (
    <AriaTextField
      isRequired={isRequired}
      isInvalid={isInvalid || !!error}
      isDisabled={isDisabled}
      className={cx("flex flex-col w-full gap-1.5", className)}
    >
      {/* Label */}
      {label && (
        <AriaLabel className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </AriaLabel>
      )}

      {/* Input Group Container */}
      <AriaGroup
        className={cx(
          "relative flex items-center w-full bg-white dark:bg-zinc-900 border rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500",
          (isInvalid || !!error)
            ? "border-red-500 focus-within:ring-red-500 focus-within:border-red-500"
            : "border-zinc-300 dark:border-zinc-700 focus-within:ring-brand-500"
        )}
      >
        {/* Leading Icon */}
        {icon && (
          <div className="pl-3.5 flex items-center justify-center select-none pointer-events-none">
            {renderIcon(icon)}
          </div>
        )}

        {/* The actual HTML Input field */}
        <AriaInput
          ref={ref}
          placeholder={placeholder}
          type={actualType}
          autoComplete={autoComplete}
          onChange={onChange as any}
          value={value}
          name={name}
          className={cx(
            "w-full bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-0",
            sizeStyles[size],
            icon && "pl-2"
          )}
          {...(otherProps as any)}
        />

        {/* Password Eye Toggle Icon */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-3.5 flex items-center justify-center text-zinc-400 hover:text-zinc-600 focus:outline-none select-none cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </AriaGroup>

      {/* Hint & Error Text */}
      {(error || hint) && (
        <div className="h-5">
          {error ? (
            <AriaText slot="errorMessage" className="text-xs text-red-500 font-medium">
              {error}
            </AriaText>
          ) : (
            <AriaText slot="description" className="text-xs text-zinc-400 dark:text-zinc-500">
              {hint}
            </AriaText>
          )}
        </div>
      )}
    </AriaTextField>
  );
});

Input.displayName = "Input";
