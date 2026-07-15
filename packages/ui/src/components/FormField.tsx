import React from "react";

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-body uppercase tracking-wider text-jisp-dark"
      >
        {label}
        {required && <span className="text-jisp-grey"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <span className="text-xs text-jisp-grey font-body">{hint}</span>
      )}
      {error && (
        <span
          id={`${htmlFor}-error`}
          role="alert"
          className="text-xs text-red-600 font-body"
        >
          {error}
        </span>
      )}
    </div>
  );
}
