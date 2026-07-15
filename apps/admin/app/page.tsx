import { redirect } from "next/navigation";

// Root of the Admin app always redirects: middleware will bounce
// unauthenticated visitors to /login, and authenticated admins land on
// /dashboard.
export default function AdminRootPage() {
  redirect("/dashboard");
}
