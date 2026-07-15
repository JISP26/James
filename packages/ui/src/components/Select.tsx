import React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, children, id, ...props }, ref) => {
    return (
      <select
        ref={ref}
        id={id}
        aria-invalid={!!error}
        className={`w-full border bg-jisp-white px-4 py-3 text-sm font-body text-jisp-black focus:outline-none focus:ring-1 focus:ring-jisp-blue ${error ? "border-red-500" : "border-jisp-light focus:border-jisp-blue"} ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
