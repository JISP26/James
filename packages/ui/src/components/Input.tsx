import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, id, ...props }, ref) => {
    return (
      <input
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={`w-full border bg-jisp-white px-4 py-3 text-sm font-body text-jisp-black placeholder:text-jisp-grey focus:outline-none focus:ring-1 focus:ring-jisp-blue ${error ? "border-red-500" : "border-jisp-light focus:border-jisp-blue"} ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
