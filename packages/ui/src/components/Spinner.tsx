import React from "react";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`h-5 w-5 animate-spin rounded-full border-2 border-jisp-light border-t-jisp-black ${className}`}
    />
  );
}

export function PageLoading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Spinner />
      <p className="text-xs uppercase tracking-wider text-jisp-grey font-body">
        {label}
      </p>
    </div>
  );
}
