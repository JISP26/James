"use client";

import React from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-jisp-black text-white hover:bg-jisp-dark disabled:bg-jisp-grey",
  secondary:
    "bg-jisp-light text-jisp-black hover:bg-jisp-blue-hover disabled:opacity-50",
  outline:
    "border border-jisp-black text-jisp-black hover:bg-jisp-blue-hover hover:border-jisp-blue disabled:opacity-40",
  ghost: "text-jisp-black hover:bg-jisp-light disabled:opacity-40",
  link: "text-jisp-black underline underline-offset-4 hover:text-jisp-blue disabled:opacity-40 p-0",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-2",
  md: "text-sm px-5 py-3",
  lg: "text-sm px-8 py-4",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      fullWidth,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={`inline-flex items-center justify-center gap-2 font-body tracking-wide uppercase text-xs md:text-[13px] transition-colors duration-200 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {isLoading && (
          <span
            className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
