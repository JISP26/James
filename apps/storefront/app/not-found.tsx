import Link from "next/link";
import { EmptyState, Button } from "@jisp/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <EmptyState
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Link href="/">
            <Button variant="primary">Return to Home</Button>
          </Link>
        }
      />
    </div>
  );
}
