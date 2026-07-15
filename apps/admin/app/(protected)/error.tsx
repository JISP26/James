"use client";

import { ErrorState } from "@jisp/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg">
      <ErrorState title="Something went wrong" description="Please try again." onRetry={reset} />
    </div>
  );
}
