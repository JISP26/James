import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, id, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        id={id}
        aria-invalid={!!error}
        className={`w-full border bg-jisp-white px-4 py-3 text-sm font-body text-jisp-black placeholder:text-jisp-grey focus:outline-none focus:ring-1 focus:ring-jisp-blue ${error ? "border-red-500" : "border-jisp-light focus:border-jisp-blue"} ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
