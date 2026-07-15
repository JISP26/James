import React from "react";
import { Button } from "./Button";

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 py-24 text-center px-4"
    >
      <h3 className="font-display text-h3 text-jisp-black">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm font-body text-jisp-grey">
          {description}
        </p>
      )}
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
