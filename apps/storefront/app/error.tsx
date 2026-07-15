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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ErrorState
        title="Something went wrong"
        description="Please try again, or return to the homepage."
        onRetry={reset}
      />
    </div>
  );
}
