import React from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-4">
      <h3 className="font-display text-h3 text-jisp-black">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm font-body text-jisp-grey">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
